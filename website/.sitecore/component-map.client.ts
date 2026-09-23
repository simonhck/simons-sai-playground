// Client-safe component map for App Router
import { NextjsContentSdkComponent } from '@sitecore-content-sdk/nextjs';


import { BYOCClientWrapper, FEaaSClientWrapper } from '@sitecore-content-sdk/nextjs';
import { Form } from '@sitecore-content-sdk/nextjs';

// end of built-in import section
import * as FaqAccordion from 'src/components/faq-accordion/FaqAccordion';
import * as FacetedFilterPanel from 'src/components/faceted-filter-panel/FacetedFilterPanel';

export const componentMap = new Map<string, NextjsContentSdkComponent>([
  ['BYOCWrapper', BYOCClientWrapper],
  ['FEaaSWrapper', FEaaSClientWrapper],
  ['Form', Form],
  ['FaqAccordion', { ...FaqAccordion }],
  ['FacetedFilterPanel', { ...FacetedFilterPanel }],
]);

export default componentMap;
