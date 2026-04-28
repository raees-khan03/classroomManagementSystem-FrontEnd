import {
  ShowView,
  ShowViewHeader,
} from "@/components/refine-ui/views/show-view";
import { ClassDetails } from "@/types";
import { useShow } from "@refinedev/core";
import { Badge } from "@/components/ui/badge";
import { bannerPhoto } from "@/lib/cloudinary";
import React from "react";

const ClassShow = () => {
  const { query } = useShow<ClassDetails>({ resource: "classes" });
  const classDetails = query.data?.data;
  const { isLoading, isError } = query;

  if (isLoading || isError || !classDetails) {
    return (
      <ShowView className="class-view class-show">
        <ShowViewHeader resource="classes" title="Class Details" />
        <p className={`state-message ${isError ? "is-error" : ""}`}>
          {isLoading
            ? "Loading class details..."
            : isError
            ? "Error loading class details."
            : "No class details found."}
        </p>
      </ShowView>
    );
  }

  const bannerUrl = classDetails.bannerCldPubId
    ? bannerPhoto(classDetails.bannerCldPubId, classDetails.name)
    : classDetails.bannerUrl ?? null;

  return (
    <ShowView className="class-view class-show">
      <ShowViewHeader resource="classes" title="Class Details" />

      {/* Banner */}
      <div className="banner">
        {bannerUrl ? (
          <div className="relative w-full">
            <img
              src={bannerUrl}
              alt={classDetails.name}
              className="w-full aspect-5/1 rounded-xl object-cover object-center shadow-md"
            />
            {!classDetails.bannerCldPubId && (
              <div className="absolute bottom-6 left-6">
                <h2 className="text-white text-3xl font-bold drop-shadow-lg">
                  {classDetails.name}
                </h2>
              </div>
            )}
          </div>
        ) : (
          <div className="placeholder relative">
            <div className="absolute bottom-6 left-6">
              <h2 className="text-white text-3xl font-bold drop-shadow-lg">
                {classDetails.name}
              </h2>
            </div>
          </div>
        )}
      </div>

      {/* Details Card */}
      <div className="details-card">
        {/* Header */}
        <div className="details-header">
          <div>
            <h1>{classDetails.name}</h1>
            <p>{classDetails.description}</p>
          </div>
          <div>
            <span className="text-sm text-muted-foreground mr-2">
              {classDetails.capacity} spots
            </span>
            <Badge data-status={classDetails.status}>
              {classDetails.status.toUpperCase()}
            </Badge>
          </div>
        </div>

        {/* Grid */}
        <div className="details-grid">
          {/* Instructor */}
          <div className="instructor">
            <p>Instructor</p>
            <div>
              {classDetails.teacher.image ? (
                <img
                  src={classDetails.teacher.image}
                  alt={classDetails.teacher.name}
                />
              ) : (
                <div className="size-13 rounded-full bg-muted flex items-center justify-center text-primary font-bold text-lg shrink-0">
                  {classDetails.teacher.name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)}
                </div>
              )}
              <div>
                <p>{classDetails.teacher.name}</p>
                <p>{classDetails.teacher.email}</p>
              </div>
            </div>
          </div>

          {/* Department */}
          <div className="department">
            <p>Department</p>
            <div>
              <p>{classDetails.department.name}</p>
              <p>{classDetails.department.description}</p>
            </div>
          </div>

          {/* Subject */}
          <div className="subject">
            <p>Subject</p>
            <div>
              <Badge variant="outline">Code: {classDetails.subject.code}</Badge>
              <p>{classDetails.subject.name}</p>
              <p>{classDetails.subject.description}</p>
            </div>
          </div>

          {/* Join Class */}
          <div className="join">
            <h2>Join Class</h2>
            <ol>
              <li>Open the app and go to Classes</li>
              <li>
                Click <strong>Join Class</strong> and enter the invite code
              </li>
              <li>
                Use code: <strong>{classDetails.inviteCode}</strong>
              </li>
              <li>You'll be added instantly upon submission</li>
            </ol>
            <button
              className="w-full mt-6 py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-semibold text-base transition-colors cursor-pointer"
              onClick={() =>
                navigator.clipboard.writeText(classDetails.inviteCode)
              }
            >
              Join Class
            </button>
          </div>
        </div>
      </div>
    </ShowView>
  );
};

export default ClassShow;
