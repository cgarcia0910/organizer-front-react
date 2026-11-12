import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createCourse } from '../../../application/use-cases/create-course';

export function useCreateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCourse,
    onSuccess: () => {
      // Invalidar la query para actualizar el listado
      queryClient.invalidateQueries({
        queryKey: ['courses'],
      });
    },
  });
}
