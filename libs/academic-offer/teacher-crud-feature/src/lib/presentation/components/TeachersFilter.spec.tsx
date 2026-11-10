import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { TeachersFilter } from './TeachersFilter';

describe('TeachersFilter', () => {
  it('llama a onSearchChange con el texto escrito', () => {
    const onSearchChange = vi.fn();
    render(<TeachersFilter search="" onSearchChange={onSearchChange} />);

    fireEvent.change(screen.getByPlaceholderText(/Buscar por nombre/), {
      target: { value: 'garcia' },
    });

    expect(onSearchChange).toHaveBeenCalledWith('garcia');
  });

  it('no incluye selector de estado', () => {
    render(<TeachersFilter search="" onSearchChange={vi.fn()} />);

    expect(screen.queryByLabelText('Estado')).toBeNull();
  });
});
