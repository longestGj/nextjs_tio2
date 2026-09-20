"use client";

import { useMemo, useState, useSyncExternalStore } from "react";

import type { MalaysiaProductHubDto } from "@/lib/content/product-hub-v01-types";

import styles from "./malaysia-product-hub.module.css";

type Selector = MalaysiaProductHubDto["selector"];
type Grade = { readonly gradeId: string; readonly href: string | null };

export function ProductSelector({
  selector,
  grades,
}: {
  readonly selector: Selector;
  readonly grades: readonly Grade[];
}) {
  const enhanced = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const [selectedId, setSelectedId] = useState(selector.applications[0].id);
  const selected =
    selector.applications.find((item) => item.id === selectedId) ??
    selector.applications[0];
  const gradeById = useMemo(
    () => new Map(grades.map((grade) => [grade.gradeId, grade])),
    [grades],
  );
  const selectedGrades = selected.gradeIds.flatMap((gradeId) => {
    const grade = gradeById.get(gradeId);
    return grade ? [grade] : [];
  });

  return (
    <div className={styles.selectorPanel}>
      <div className={styles.selectorControls}>
        <h3>{selector.controlLabel}</h3>
        <div
          className={styles.applicationGrid}
          role="group"
          aria-label={selector.controlLabel}
        >
          {selector.applications.map((application) => (
            <button
              key={application.id}
              type="button"
              disabled={!enhanced}
              aria-pressed={selected.id === application.id}
              onClick={() => setSelectedId(application.id)}
            >
              {application.label}
            </button>
          ))}
        </div>
      </div>
      <div
        className={styles.selectorResults}
        aria-live="polite"
        aria-atomic="true"
      >
        <h3>
          {selector.resultHeading} — {selectedGrades.length}
        </h3>
        {selectedGrades.length ? (
          <div className={styles.resultGrid}>
            {selectedGrades.map((grade) => (
              <div key={grade.gradeId}>
                <strong>{grade.gradeId}</strong>
                {grade.href ? (
                  <a
                    aria-label={`View ${grade.gradeId} grade`}
                    href={grade.href}
                  >
                    {selector.resultActionLabel}
                  </a>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <p className={styles.noResult}>{selector.noResult}</p>
        )}
        <p className={styles.selectorDisclaimer}>{selector.disclaimer}</p>
      </div>
    </div>
  );
}
