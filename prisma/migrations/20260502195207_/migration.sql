-- CreateEnum
CREATE TYPE "Role" AS ENUM ('CANDIDATE', 'RECRUITER');

-- CreateTable
CREATE TABLE "users" (
    "user_ID" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'CANDIDATE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("user_ID")
);

-- CreateTable
CREATE TABLE "jobs" (
    "job_ID" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "jobs_pkey" PRIMARY KEY ("job_ID")
);

-- CreateTable
CREATE TABLE "job_skills" (
    "job_ID" TEXT NOT NULL,
    "skill_ID" TEXT NOT NULL,
    "weight" INTEGER NOT NULL DEFAULT 3,

    CONSTRAINT "job_skills_pkey" PRIMARY KEY ("job_ID","skill_ID")
);

-- CreateTable
CREATE TABLE "candidate_profiles" (
    "candidate_ID" TEXT NOT NULL,
    "user_ID" TEXT NOT NULL,
    "name" TEXT,
    "experience_years" INTEGER,
    "education" TEXT,
    "resume_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "candidate_profiles_pkey" PRIMARY KEY ("candidate_ID")
);

-- CreateTable
CREATE TABLE "skills" (
    "skill_ID" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "skills_pkey" PRIMARY KEY ("skill_ID")
);

-- CreateTable
CREATE TABLE "skill_aliases" (
    "alias" TEXT NOT NULL,
    "skill_ID" TEXT NOT NULL,

    CONSTRAINT "skill_aliases_pkey" PRIMARY KEY ("alias")
);

-- CreateTable
CREATE TABLE "skill_relationships" (
    "parent_skill_ID" TEXT NOT NULL,
    "child_skill_ID" TEXT NOT NULL,

    CONSTRAINT "skill_relationships_pkey" PRIMARY KEY ("parent_skill_ID","child_skill_ID")
);

-- CreateTable
CREATE TABLE "candidate_skills" (
    "candidate_ID" TEXT NOT NULL,
    "skill_ID" TEXT NOT NULL,

    CONSTRAINT "candidate_skills_pkey" PRIMARY KEY ("candidate_ID","skill_ID")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "candidate_profiles_user_ID_key" ON "candidate_profiles"("user_ID");

-- CreateIndex
CREATE UNIQUE INDEX "skills_name_key" ON "skills"("name");

-- CreateIndex
CREATE INDEX "skill_aliases_alias_idx" ON "skill_aliases"("alias");

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("user_ID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_skills" ADD CONSTRAINT "job_skills_job_ID_fkey" FOREIGN KEY ("job_ID") REFERENCES "jobs"("job_ID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_skills" ADD CONSTRAINT "job_skills_skill_ID_fkey" FOREIGN KEY ("skill_ID") REFERENCES "skills"("skill_ID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_profiles" ADD CONSTRAINT "candidate_profiles_user_ID_fkey" FOREIGN KEY ("user_ID") REFERENCES "users"("user_ID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skill_aliases" ADD CONSTRAINT "skill_aliases_skill_ID_fkey" FOREIGN KEY ("skill_ID") REFERENCES "skills"("skill_ID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skill_relationships" ADD CONSTRAINT "skill_relationships_parent_skill_ID_fkey" FOREIGN KEY ("parent_skill_ID") REFERENCES "skills"("skill_ID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skill_relationships" ADD CONSTRAINT "skill_relationships_child_skill_ID_fkey" FOREIGN KEY ("child_skill_ID") REFERENCES "skills"("skill_ID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_skills" ADD CONSTRAINT "candidate_skills_candidate_ID_fkey" FOREIGN KEY ("candidate_ID") REFERENCES "candidate_profiles"("candidate_ID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_skills" ADD CONSTRAINT "candidate_skills_skill_ID_fkey" FOREIGN KEY ("skill_ID") REFERENCES "skills"("skill_ID") ON DELETE CASCADE ON UPDATE CASCADE;
