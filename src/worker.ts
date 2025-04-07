import { Worker, Job } from "bullmq";
import { TaskQueue } from "./queue";  // Using the existing TaskQueue singleton

const queueName = "task-scheduler";

export const startWorker = async () => {
  console.log("Initialized worker...");
  const queue = await TaskQueue.init();
  
  if (!queue) {
    console.error("Queue is not initialized, exiting worker...");
    return;
  }

  const worker = new Worker(queueName, async (job: Job) => {
    console.log(`Processing job ${job.name}...`);
  
    try {
      // Dynamically load the job handler
      const module = await import(`./jobs/${job.name}`);  // Assuming the job file is in the jobs directory
      if (module.default) {
        await module.default(job);  // Call the job handler with the job object
        console.log(`${job.name} processed successfully.`);
      } else {
        console.error(`Handler not found for job: ${job.name}`);
      }
    } catch (err) {
      console.error(`Error while processing job ${job.name}:`, err);
      throw err;  // Rethrow to ensure failure handling in BullMQ
    }
  }, {
    connection: TaskQueue.getConnection(),
    concurrency: 5,
  });

  worker.on('completed', job => {
    console.log(`${job.id} has completed!`);
  });
  
  worker.on('failed', (job, err) => {
    console.log(`${job?.id} has failed with ${err.message}`);
  });

  console.log('Worker started and listening for jobs...');
};

