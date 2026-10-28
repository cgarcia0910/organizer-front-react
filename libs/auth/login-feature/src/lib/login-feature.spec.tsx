import { render } from '@testing-library/react';

import LoginFeature from './login-feature';

describe('LoginFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<LoginFeature />);
    expect(baseElement).toBeTruthy();
  });
});
