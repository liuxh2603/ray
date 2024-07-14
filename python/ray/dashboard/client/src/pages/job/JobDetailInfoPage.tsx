import { Box, Typography } from "@mui/material";
import React from "react";
import {
  CodeDialogButton,
  CodeDialogButtonWithPreview,
} from "../../common/CodeDialogButton";
import { DurationText } from "../../common/DurationText";
import { formatDateFromTimeMs } from "../../common/formatUtils";
import { JobStatusWithIcon } from "../../common/JobStatus";
import {
  CpuProfilingLink,
  CpuStackTraceLink,
  MemoryProfilingButton,
} from "../../common/ProfilingLink";
import { filterRuntimeEnvSystemVariables } from "../../common/util";
import Loading from "../../components/Loading";
import { MetadataSection } from "../../components/MetadataSection";
import { StatusChip } from "../../components/StatusChip";
import TitleCard from "../../components/TitleCard";
import { UnifiedJob } from "../../type/job";
import { MainNavPageInfo } from "../layout/mainNavContext";

import { useJobDetail } from "./hook/useJobDetail";

export const JobDetailInfoPage = () => {
  // TODO(aguo): Add more content to this page!

  const { job, msg, isLoading, params } = useJobDetail();

  if (!job) {
    return (
      <Box sx={{ padding: 2, backgroundColor: "white" }}>
        <MainNavPageInfo
          pageInfo={{
            title: "Info",
            id: "job-info",
            path: "info",
          }}
        />
        <Loading loading={isLoading} />
        <TitleCard title={`JOB - ${params.jobId}`}>
          <StatusChip type="job" status="LOADING" />
          <br />
          Request Status: {msg} <br />
        </TitleCard>
      </Box>
    );
  }

  return (
    <Box sx={{ padding: 2, backgroundColor: "white" }}>
      <MainNavPageInfo
        pageInfo={{
          title: "Info",
          id: "job-info",
          path: job.job_id ? `/jobs/${job.job_id}/info` : undefined,
        }}
      />
      <Typography variant="h2">{job.job_id}</Typography>
      <JobMetadataSection job={job} />
    </Box>
  );
};

type JobMetadataSectionProps = {
  job: UnifiedJob;
};

export const JobMetadataSection = ({ job }: JobMetadataSectionProps) => {
  return (
    <MetadataSection
      metadataList={[
        {
          label: "Entrypoint",
          content: job.entrypoint
            ? {
                value: job.entrypoint,
                copyableValue: job.entrypoint,
              }
            : { value: "-" },
        },
        {
          label: "Status",
          content: (
            <React.Fragment>
              <JobStatusWithIcon job={job} />{" "}
              {job.message && (
                <CodeDialogButton
                  title="Status details"
                  code={job.message}
                  buttonText="View details"
                />
              )}
            </React.Fragment>
          ),
        },
        {
          label: "Job ID",
          content: job.job_id
            ? {
                value: job.job_id,
                copyableValue: job.job_id,
              }
            : { value: "-" },
        },
        {
          label: "Submission ID",
          content: job.submission_id
            ? {
                value: job.submission_id,
                copyableValue: job.submission_id,
              }
            : {
                value: "-",
              },
        },
        {
          label: "Duration",
          content: job.start_time ? (
            <DurationText startTime={job.start_time} endTime={job.end_time} />
          ) : (
            <React.Fragment>-</React.Fragment>
          ),
        },
        {
          label: "Started at",
          content: {
            value: job.start_time ? formatDateFromTimeMs(job.start_time) : "-",
          },
        },
        {
          label: "Ended at",
          content: {
            value: job.end_time ? formatDateFromTimeMs(job.end_time) : "-",
          },
        },
        {
          label: "Runtime environment",
          ...(job.runtime_env
            ? {
                content: (
                  <CodeDialogButton
                    title="Runtime environment"
                    code={filterRuntimeEnvSystemVariables(job.runtime_env)}
                  />
                ),
              }
            : {
                content: {
                  value: "-",
                },
              }),
        },
        ...(job.type === "SUBMISSION"
          ? [
              {
                label: "User-provided metadata",
                content:
                  job.metadata && Object.keys(job.metadata).length ? (
                    <CodeDialogButtonWithPreview
                      sx={{ display: "inline-flex", maxWidth: "100%" }}
                      title="User-provided metadata"
                      code={JSON.stringify(job.metadata, undefined, 2)}
                    />
                  ) : undefined,
              },
            ]
          : []),
        {
          label: "Actions",
          content: (
            <div>
              <CpuStackTraceLink
                pid={job.driver_info?.pid}
                ip={job.driver_info?.node_ip_address}
                type="Driver"
              />
              <br />
              <CpuProfilingLink
                pid={job.driver_info?.pid}
                ip={job.driver_info?.node_ip_address}
                type="Driver"
              />
              <br />
              <MemoryProfilingButton
                pid={job.driver_info?.pid}
                ip={job.driver_info?.node_ip_address}
                type="Driver"
              />
            </div>
          ),
        },
      ]}
    />
  );
};
