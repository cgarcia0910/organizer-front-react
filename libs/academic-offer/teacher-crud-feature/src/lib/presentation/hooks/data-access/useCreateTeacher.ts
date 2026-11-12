import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createTeacher } from '../../../application/use-cases/create-teacher';
import { PartialSaveError } from '../../../application/errors';

export function useCreateTeacher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTeacher,
    onSuccess: (created, variables) => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      if (variables.habilitations?.length) {
        queryClient.invalidateQueries({ queryKey: ['teacher-habilitations', created.id] });
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
