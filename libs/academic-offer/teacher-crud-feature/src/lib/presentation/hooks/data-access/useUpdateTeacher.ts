import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateTeacher } from '../../../application/use-cases/update-teacher';
import { PartialSaveError } from '../../../application/errors';

export function useUpdateTeacher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateTeacher,
    onSuccess: (_updated, variables) => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      if (variables.habilitations?.length) {
        queryClient.invalidateQueries({ queryKey: ['teacher-habilitations', variables.id] });
      }
    },
    onError: (error) => {
      if (error instanceof PartialSaveError) {
        queryClient.invalidateQueries({ queryKey: ['teachers'] });
        queryClient.invalidateQueries({ queryKey: ['teacher-habilitations', error.teacherId] });
      }
    },
  });
}
