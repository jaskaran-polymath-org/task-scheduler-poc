import { TaskQueue } from "./queue";
import { config } from "./loadConfig";
import { startWorker } from "./worker";

async function bootstrap() {
  await TaskQueue.init();
  const bullMQ = TaskQueue.getQueue();

  const jobs = config.jobs;
  const jobNames = [];
  if(!bullMQ) return;

  for (const job of jobs) {
    await bullMQ.upsertJobScheduler(job.name, { pattern: job.schedule } );
    jobNames.push(job.name);
  }

  // Remove jobs that are not present in config anymore
  const existingJobs = await bullMQ.getJobs();
  for(const existingJob of existingJobs) {
    if(!jobNames.includes(existingJob.name)){
      await bullMQ.removeJobScheduler(existingJob.name);
    }
  }

  startWorker();
  console.log("Job scheduler is running...");
}

bootstrap();


