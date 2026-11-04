import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateCourse } from '../../../application/use-cases/update-course';

export function useUpdateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCourse,
    onSuccess: () => {
      // Invalidar la query para actualizar el listado
      queryClient.invalidateQueries({
        queryKey: ['courses'],
      });
    },
  });
}
