import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PromptModal } from '../../src/content/prompt/PromptModal';

describe('PromptModal Component', () => {
  it('renders matched and skipped field counts', () => {
    render(
      <PromptModal
        matchedCount={18}
        skippedCount={4}
        studentName="Harsh Partap Jain"
        onAccept={vi.fn()}
        onReject={vi.fn()}
        onClose={vi.fn()}
        onEdit={vi.fn()}
      />
    );

    expect(screen.getByText(/18 fields ready/i)).toBeDefined();
    expect(screen.getByText(/4 manual questions/i)).toBeDefined();
    expect(screen.getAllByText(/Harsh Partap Jain/i).length).toBeGreaterThanOrEqual(1);
  });

  it('triggers onAccept when Accept button is clicked', () => {
    const handleAccept = vi.fn();
    render(
      <PromptModal
        matchedCount={18}
        skippedCount={4}
        studentName="Harsh Partap Jain"
        onAccept={handleAccept}
        onReject={vi.fn()}
        onClose={vi.fn()}
        onEdit={vi.fn()}
      />
    );

    const acceptBtn = screen.getByRole('button', { name: /autofill/i });
    fireEvent.click(acceptBtn);
    expect(handleAccept).toHaveBeenCalledTimes(1);
  });

  it('triggers onReject when Reject button is clicked', () => {
    const handleReject = vi.fn();
    render(
      <PromptModal
        matchedCount={18}
        skippedCount={4}
        onAccept={vi.fn()}
        onReject={handleReject}
        onClose={vi.fn()}
        onEdit={vi.fn()}
      />
    );

    const rejectBtn = screen.getByRole('button', { name: /reject/i });
    fireEvent.click(rejectBtn);
    expect(handleReject).toHaveBeenCalledTimes(1);
  });

  it('triggers onClose when Close button is clicked', () => {
    const handleClose = vi.fn();
    render(
      <PromptModal
        matchedCount={18}
        skippedCount={4}
        onAccept={vi.fn()}
        onReject={vi.fn()}
        onClose={handleClose}
        onEdit={vi.fn()}
      />
    );

    const closeBtn = screen.getByLabelText(/close prompt/i);
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('triggers onEdit when Edit button is clicked', () => {
    const handleEdit = vi.fn();
    render(
      <PromptModal
        matchedCount={18}
        skippedCount={4}
        onAccept={vi.fn()}
        onReject={vi.fn()}
        onClose={vi.fn()}
        onEdit={handleEdit}
      />
    );

    const editBtn = screen.getByRole('button', { name: /edit profile/i });
    fireEvent.click(editBtn);
    expect(handleEdit).toHaveBeenCalledTimes(1);
  });

  it('shows completion summary state after autofill', () => {
    render(
      <PromptModal
        matchedCount={18}
        skippedCount={4}
        isCompleted={true}
        filledCount={18}
        onAccept={vi.fn()}
        onReject={vi.fn()}
        onClose={vi.fn()}
        onEdit={vi.fn()}
      />
    );

    expect(screen.getByText(/Autofill Complete/i)).toBeDefined();
    expect(screen.getByText(/18 questions filled/i)).toBeDefined();
  });
});
