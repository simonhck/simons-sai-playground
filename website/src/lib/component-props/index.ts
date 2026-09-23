import { ComponentParams, ComponentRendering, Page } from '@sitecore-content-sdk/nextjs';

/**
 * Shared component props.
 * `page` is injected by `AppPlaceholder` for every rendered component.
 */
export type ComponentProps = {
  rendering: ComponentRendering;
  params: ComponentParams & {
    /**
     * The identifier for the rendering
     */
    RenderingIdentifier?: string;
    /**
     * The styles for the rendering
     * This value is calculated by the Placeholder component
     */
    styles?: string;
    /**
     * The enabled placeholders for the rendering
     */
    EnabledPlaceholders?: string;
  };
  page: Page;
};

/**
 * Alias kept for parity with the Content SDK 2.2 starter template.
 */
export type ComponentWithContextProps = ComponentProps;
