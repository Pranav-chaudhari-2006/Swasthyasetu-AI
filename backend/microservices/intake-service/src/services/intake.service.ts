import { db } from '../db/database';
import { bhashiniAdapter } from './bhashini.adapter';
import { structuringService } from './structuring.service';
import { IntakeSession, IntakeMessage, StructuredIntakeFacts, ClarificationQuestion, MessageSenderType } from '../types';

export class IntakeService {
  async startSession(data: {
    caseId: string;
    patientId: string;
    operatedBy?: string;
    languageCode?: string;
  }): Promise<IntakeSession> {
    return db.createSession(data);
  }

  async processMessage(data: {
    sessionId: string;
    senderType: MessageSenderType;
    rawText?: string;
    audioBase64?: string;
    languageCode?: string;
  }): Promise<{
    message: IntakeMessage;
    facts: StructuredIntakeFacts;
    clarifications: ClarificationQuestion[];
  }> {
    const session = await db.findSessionById(data.sessionId);
    if (!session) {
      throw new Error(`Intake session '${data.sessionId}' does not exist`);
    }

    let textContent = data.rawText || '';
    const lang = data.languageCode || session.languageCode || 'hi';

    // If audio was provided, transcribe via Bhashini adapter
    if (data.audioBase64) {
      const asr = await bhashiniAdapter.transcribeAudio(data.audioBase64, lang);
      textContent = asr.transcribedText;
    }

    // Translate to English for NLP processing if non-English
    let translatedText: string | undefined;
    if (lang !== 'en') {
      const translation = await bhashiniAdapter.translateText(textContent, lang, 'en');
      translatedText = translation.translatedText;
    }

    // Record incoming message in conversation store
    const message = await db.addMessage({
      sessionId: data.sessionId,
      senderType: data.senderType,
      rawContent: textContent,
      translatedContent: translatedText,
      languageCode: lang,
    });

    // Re-evaluate structuring over full conversation
    const allMessages = await db.getMessagesBySessionId(data.sessionId);
    const { facts, clarifications } = await structuringService.extractStructuredFacts({
      sessionId: session.id,
      caseId: session.caseId,
      patientId: session.patientId,
      messages: allMessages,
    });

    // Save structured facts
    await db.saveStructuredFacts(facts);

    // Update session status
    const status = clarifications.length > 0 ? 'NEEDS_CLARIFICATION' : 'STRUCTURED';
    await db.updateSessionStatus(session.id, status);

    return { message, facts, clarifications };
  }

  async getStructuredFacts(sessionId: string): Promise<StructuredIntakeFacts | null> {
    return db.getStructuredFactsBySessionId(sessionId);
  }

  async getSessionMessages(sessionId: string): Promise<IntakeMessage[]> {
    return db.getMessagesBySessionId(sessionId);
  }
}

export const intakeService = new IntakeService();
