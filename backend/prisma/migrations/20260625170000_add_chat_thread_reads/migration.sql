-- CreateTable
CREATE TABLE "chat_thread_reads" (
    "userId" TEXT NOT NULL,
    "threadId" INTEGER NOT NULL,
    "readAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_thread_reads_pkey" PRIMARY KEY ("userId","threadId")
);

-- AddForeignKey
ALTER TABLE "chat_thread_reads" ADD CONSTRAINT "chat_thread_reads_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_thread_reads" ADD CONSTRAINT "chat_thread_reads_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "ChatThread"("id") ON DELETE CASCADE ON UPDATE CASCADE;
