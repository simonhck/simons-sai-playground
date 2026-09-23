// Below are built-in components that are available in the app, it's recommended to keep them as is
import { NextjsContentSdkComponent } from '@sitecore-content-sdk/nextjs';


import { BYOCServerWrapper, FEaaSServerWrapper } from '@sitecore-content-sdk/nextjs';
import { Form } from '@sitecore-content-sdk/nextjs';

// end of built-in import section
import * as RelatedContentGrid from 'src/components/related-content-grid/RelatedContentGrid';
import * as ProductCardGrid from 'src/components/product-card-grid/ProductCardGrid';
import * as PricingPlans from 'src/components/pricing-plans/PricingPlans';
import * as PartialDesignDynamicPlaceholder from 'src/components/partial-design-dynamic-placeholder/PartialDesignDynamicPlaceholder';
import * as HeroBanner from 'src/components/hero-banner/HeroBanner';
import * as Header from 'src/components/header/Header';
import * as Footer from 'src/components/footer/Footer';
import * as FeatureGrid from 'src/components/feature-grid/FeatureGrid';
import * as FaqAccordion from 'src/components/faq-accordion/FaqAccordion';
import * as FacetedFilterPanel from 'src/components/faceted-filter-panel/FacetedFilterPanel';
import * as CtaBand from 'src/components/cta-band/CtaBand';
import * as ComparisonTable from 'src/components/comparison-table/ComparisonTable';
import * as AuthorBioCard from 'src/components/author-bio-card/AuthorBioCard';
import * as ArticleHero from 'src/components/article-hero/ArticleHero';

export const componentMap = new Map<string, NextjsContentSdkComponent>([
  ['BYOCWrapper', BYOCServerWrapper],
  ['FEaaSWrapper', FEaaSServerWrapper],
  ['Form', { ...Form, componentType: 'client' }],
  ['RelatedContentGrid', { ...RelatedContentGrid }],
  ['ProductCardGrid', { ...ProductCardGrid }],
  ['PricingPlans', { ...PricingPlans }],
  ['PartialDesignDynamicPlaceholder', { ...PartialDesignDynamicPlaceholder }],
  ['HeroBanner', { ...HeroBanner }],
  ['Header', { ...Header }],
  ['Footer', { ...Footer }],
  ['FeatureGrid', { ...FeatureGrid }],
  ['FaqAccordion', { ...FaqAccordion, componentType: 'client' }],
  ['FacetedFilterPanel', { ...FacetedFilterPanel, componentType: 'client' }],
  ['CtaBand', { ...CtaBand }],
  ['ComparisonTable', { ...ComparisonTable }],
  ['AuthorBioCard', { ...AuthorBioCard }],
  ['ArticleHero', { ...ArticleHero }],
]);

export default componentMap;
