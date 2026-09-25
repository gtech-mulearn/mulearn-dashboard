/**
 * Mentor tab sort contracts: applications, change requests, roster.
 *
 * 📍 src/features/mentor/admin/components/sort-contract.test.ts
 */
import { describeSortContract } from "@/test-utils/sort-contract";
import { ROSTER_COLUMNS } from "./mentor-roster-tab";
import {
  APPLICATION_COLUMNS,
  CHANGE_REQUEST_COLUMNS,
} from "./mentor-verification-page";

// Copied from mulearnbackend/api/dashboard/mentor/mentor_views.py sort_fields
// (MentorListAPI, MentorChangeRequestListAPI, MentorRosterAPI). Change both
// together.
const APPLICATION_SORT_FIELDS = ["created_at", "status", "user_full_name"];
const CHANGE_REQUEST_SORT_FIELDS = ["created_at", "user_full_name"];
const ROSTER_SORT_FIELDS = ["created_at", "user_full_name"];

describeSortContract(
  "Mentor applications",
  APPLICATION_COLUMNS,
  APPLICATION_SORT_FIELDS,
);
describeSortContract(
  "Mentor change requests",
  CHANGE_REQUEST_COLUMNS,
  CHANGE_REQUEST_SORT_FIELDS,
);
describeSortContract("Mentor roster", ROSTER_COLUMNS, ROSTER_SORT_FIELDS);
