import { Router } from 'express';
import { LogModel } from '../models/Log';

export const statsRouter = Router();

type Interval = 'minute' | 'hour' | 'day';

statsRouter.get('/logs', async (req, res) => {
  const { from, to, interval = 'minute', tz = 'UTC', points } = req.query as Record<string, string>;

  const validInterval: Interval = (['minute', 'hour', 'day'] as const).includes(
    interval as Interval
  )
    ? (interval as Interval)
    : 'minute';

  const numPoints = Math.min(Math.max(Number(points) || 60, 1), 1000);

  const endDate = to ? new Date(to) : new Date();
  const startDate = from
    ? new Date(from)
    : new Date(
        endDate.getTime() -
          numPoints *
            (validInterval === 'minute' ? 60_000 : validInterval === 'hour' ? 3_600_000 : 86_400_000)
      );

  const matchStage = {
    $match: {
      timestamp: { $gte: startDate, $lte: endDate },
    },
  } as const;

  const addFieldsStage = {
    $addFields: {
      bucket: { $dateTrunc: { date: '$timestamp', unit: validInterval, timezone: tz } },
    },
  } as const;

  const groupStage = {
    $group: {
      _id: '$bucket',
      info: { $sum: { $cond: [{ $eq: ['$level', 'info'] }, 1, 0] } },
      warn: { $sum: { $cond: [{ $eq: ['$level', 'warn'] }, 1, 0] } },
      error: { $sum: { $cond: [{ $eq: ['$level', 'error'] }, 1, 0] } },
      debug: { $sum: { $cond: [{ $eq: ['$level', 'debug'] }, 1, 0] } },
    },
  } as const;

  const sortStage = { $sort: { _id: 1 } } as const;

  const [timelineAgg, levelAgg] = await Promise.all([
    LogModel.aggregate([matchStage, addFieldsStage, groupStage, sortStage]),
    LogModel.aggregate([
      matchStage,
      {
        $group: {
          _id: '$level',
          count: { $sum: 1 },
        },
      },
    ]),
  ]);

  const timeline = timelineAgg.map((it: any) => ({
    time: new Date(it._id).toISOString(),
    info: it.info || 0,
    warn: it.warn || 0,
    error: it.error || 0,
    debug: it.debug || 0,
  }));

  const countsByLevel: Record<string, number> = { info: 0, warn: 0, error: 0, debug: 0 };
  for (const row of levelAgg) countsByLevel[row._id] = row.count;

  res.json({ countsByLevel, timeline });
});


