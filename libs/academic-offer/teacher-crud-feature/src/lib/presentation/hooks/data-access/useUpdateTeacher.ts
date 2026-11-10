import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateTeacher } from '../../../application/use-cases/update-teacher';

export function useUpdateTeacher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateTeacher,
    onSuccess: () => {
      // Invalidar la query para actualizar el listado
      queryClient.invalidateQueries({
        queryKey: ['teachers'],
      });
    },
  });
}
