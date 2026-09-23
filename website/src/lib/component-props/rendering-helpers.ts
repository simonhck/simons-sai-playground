import { ComponentParams } from '@sitecore-content-sdk/nextjs';

/**
 * Root element attributes derived from Sitecore rendering parameters.
 */
export type RenderingAttributes = {
  id?: string;
};

/**
 * Builds the attributes to spread onto a component's root element.
 * Maps the SXA `RenderingIdentifier` parameter to the element `id` so authors can use it as an anchor target.
 * Styling is intentionally excluded; components apply `params.styles` to their own `className`.
 *
 * @param {ComponentParams | undefined} params Rendering parameters from the layout service.
 * @returns {RenderingAttributes} Attributes safe to spread onto the root element.
 */
export const getRenderingAttributes = (params: ComponentParams | undefined): RenderingAttributes => {
  const id = params?.RenderingIdentifier?.trim();
  return id ? { id } : {};
};
