import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createTeacher } from '../../../application/use-cases/create-teacher';

export function useCreateTeacher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTeacher,
    onSuccess: () => {
      // Invalidar la query para actualizar el listado
      queryClient.invalidateQueries({
        queryKey: ['teachers'],
      });
    },
  });
}
