import { describe, expect, it } from "vitest";
import { ApiError } from "@/lib/http/api-error";
import {
  nonNegativeNumber,
  optionalString,
  parseJsonObject,
  requiredString,
} from "@/lib/validation";
import { parsePositiveId, parsePagination } from "@/lib/http/request";
import { paginationConfig } from "@/lib/pagination";

describe("shared validation", () => {
  it("accepts and trims required strings", () => {
    expect(requiredString({ name: "  Kegiatan  " }, "name")).toBe("Kegiatan");
  });

  it("rejects missing required strings", () => {
    expect(() => requiredString({}, "name")).toThrowError(ApiError);
  });

  it("handles optional strings without accepting non-strings", () => {
    expect(optionalString({}, "name")).toBeUndefined();
    expect(() => optionalString({ name: 1 }, "name")).toThrowError(ApiError);
  });

  it("rejects negative numbers", () => {
    expect(() => nonNegativeNumber({ value: -1 }, "value")).toThrowError(ApiError);
  });

  it("validates positive ids and pagination", () => {
    expect(parsePositiveId("3")).toBe(3);
    expect(parsePagination(new URLSearchParams("page=2&pageSize=10"))).toEqual({
      page: 2,
      pageSize: 10,
      skip: 10,
    });
    expect(() => parsePositiveId("0")).toThrowError(ApiError);
    expect(() => parsePagination(new URLSearchParams("pageSize=101"))).toThrowError(ApiError);
    expect(parsePagination(new URLSearchParams())).toEqual({
      page: paginationConfig.defaultPage,
      pageSize: paginationConfig.defaultPageSize,
      skip: 0,
    });
  });

  it("only accepts JSON objects", () => {
    expect(parseJsonObject({ ok: true })).toEqual({ ok: true });
    expect(() => parseJsonObject([])).toThrowError(ApiError);
  });
});
