import {
  Configuration, SubjectsApiFp
} from '@cgarcia0910/api-academiccatalog';
import { Page } from '../../domain/entities/page';
import { Subject } from '../../domain/entities/subject';

const subjectsApi = SubjectsApiFp(new Configuration({ basePath: '/resources' }));
export async function getCourseSubjects(
    courseId: string,
): Promise<Page<Subject>> {
  const request = await subjectsApi.listSubjects(
    courseId,
  );
  return (await request()).data;
}
