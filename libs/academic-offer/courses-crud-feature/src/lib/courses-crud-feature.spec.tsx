import { render } from '@testing-library/react';

import CoursesCrudFeature from './courses-crud-feature';

describe('CoursesCrudFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<CoursesCrudFeature />);
    expect(baseElement).toBeTruthy();
  });
});
