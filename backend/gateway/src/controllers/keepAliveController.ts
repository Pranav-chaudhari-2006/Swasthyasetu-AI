import { Request, Response } from 'express';
import { keepAliveService } from '../services/keepAliveService';

export class KeepAliveController {
  public static getStatus(req: Request, res: Response): void {
    const status = keepAliveService.getStatus();
    res.status(200).json({
      success: true,
      service: 'render-keepalive-engine',
      data: status
    });
  }

  public static async triggerPing(req: Request, res: Response): Promise<void> {
    const customUrl = req.body?.targetUrl || (req.query?.url as string);
    const result = await keepAliveService.pingNow(customUrl);
    res.status(200).json({
      success: true,
      message: 'Ping executed successfully',
      data: result
    });
  }

  public static startService(req: Request, res: Response): void {
    keepAliveService.start();
    res.status(200).json({
      success: true,
      message: 'Render keep-alive background worker started',
      data: keepAliveService.getStatus()
    });
  }

  public static stopService(req: Request, res: Response): void {
    keepAliveService.stop();
    res.status(200).json({
      success: true,
      message: 'Render keep-alive background worker stopped',
      data: keepAliveService.getStatus()
    });
  }

  public static configure(req: Request, res: Response): void {
    const { targetUrl, minIntervalSec, maxIntervalSec, autoStart } = req.body;
    const updatedStatus = keepAliveService.configure({
      targetUrl,
      minIntervalSec,
      maxIntervalSec,
      autoStart
    });

    res.status(200).json({
      success: true,
      message: 'Render keep-alive service reconfigured successfully',
      data: updatedStatus
    });
  }
}
