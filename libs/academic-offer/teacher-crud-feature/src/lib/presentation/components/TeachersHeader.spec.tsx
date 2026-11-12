import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { TeachersHeader } from './TeachersHeader';

describe('TeachersHeader', () => {
  it('el botón "Nuevo profesor" llama a onCreate', () => {
    const onCreate = vi.fn();
    render(<TeachersHeader onCreate={onCreate} />);

    fireEvent.click(screen.getByRole('button', { name: /Nuevo profesor/ }));

    expect(onCreate).toHaveBeenCalledTimes(1);
  });
});
