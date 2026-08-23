import { Request, Response } from 'express';
import { waitlistService } from './waitlist.service.js';

export class WaitlistController {
  async joinWaitlist(req: Request, res: Response) {
    try {
      const { email, name, profession } = req.body;
      
      if (!email || !name || !profession) {
        return res.status(400).json({ error: 'Email, name, and profession are required' });
      }

      const entry = await waitlistService.joinWaitlist({ email, name, profession });
      res.status(201).json(entry);
    } catch (error: any) {
      if (error.message === 'Email is already on the waitlist') {
        return res.status(409).json({ error: error.message });
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getWaitlist(req: Request, res: Response) {
    try {
      const entries = await waitlistService.getWaitlist();
      res.json(entries);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export const waitlistController = new WaitlistController();
