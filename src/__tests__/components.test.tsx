import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SeverityBadge } from "@/components/ui/severity-badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ScoreRing } from "@/components/ui/score-ring";
import { Shield } from "lucide-react";

describe("SeverityBadge", () => {
  it("renders severity text", () => {
    render(<SeverityBadge severity="critical" />);
    expect(screen.getByText("critical")).toBeInTheDocument();
  });

  it("renders count when provided", () => {
    render(<SeverityBadge severity="warning" count={5} />);
    expect(screen.getByText("warning")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("applies severity-specific classes", () => {
    const { container } = render(<SeverityBadge severity="critical" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain("text-red-400");
  });
});

describe("StatusBadge", () => {
  it("renders status text", () => {
    render(<StatusBadge status="completed" />);
    expect(screen.getByText("completed")).toBeInTheDocument();
  });

  it("shows pulse for running states", () => {
    const { container } = render(<StatusBadge status="scanning" />);
    const pulses = container.querySelectorAll(".animate-ping");
    expect(pulses.length).toBe(1);
  });

  it("does not show pulse for completed state", () => {
    const { container } = render(<StatusBadge status="completed" />);
    const pulses = container.querySelectorAll(".animate-ping");
    expect(pulses.length).toBe(0);
  });
});

describe("EmptyState", () => {
  it("renders title and description", () => {
    render(
      <EmptyState
        icon={Shield}
        title="No data"
        description="Nothing to show"
      />
    );
    expect(screen.getByText("No data")).toBeInTheDocument();
    expect(screen.getByText("Nothing to show")).toBeInTheDocument();
  });

  it("renders children when provided", () => {
    render(
      <EmptyState icon={Shield} title="Empty" description="Desc">
        <button>Action</button>
      </EmptyState>
    );
    expect(screen.getByText("Action")).toBeInTheDocument();
  });
});

describe("ScoreRing", () => {
  it("renders the score value", () => {
    render(<ScoreRing score={85} />);
    expect(screen.getByText("85")).toBeInTheDocument();
  });

  it("renders SVG with circles", () => {
    const { container } = render(<ScoreRing score={50} />);
    const circles = container.querySelectorAll("circle");
    expect(circles.length).toBe(2); // track + progress
  });

  it("applies green color for high scores", () => {
    render(<ScoreRing score={90} />);
    const scoreText = screen.getByText("90");
    expect(scoreText.style.color).toBe("rgb(52, 211, 153)"); // #34d399
  });

  it("applies red color for low scores", () => {
    render(<ScoreRing score={20} />);
    const scoreText = screen.getByText("20");
    expect(scoreText.style.color).toBe("rgb(248, 113, 113)"); // #f87171
  });
});
