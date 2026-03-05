import { JSX } from 'react';
import {
	Field,
	Image,
	ImageField,
	Link,
	LinkField,
	RichText,
	Text,
} from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

type HeroBannerDatasource = {
	Headline?: Field<string>;
	IntroText?: Field<string>;
	Image?: ImageField;
	CTA?: LinkField;
};

type HeroBannerProps = ComponentProps & {
	fields: HeroBannerDatasource;
};

export const Intro = ({ fields, page }: HeroBannerProps): JSX.Element => {
	const isEditing = page.mode.isEditing;
	const headlineField = fields?.Headline;
	const introTextField = fields?.IntroText;
	const ctaField = fields?.CTA;
	const imageField = fields?.Image;

  console.log('fields', fields);

	if (!fields && !isEditing) {
		return <></>;
	}

	return (
		<section className="mx-auto mt-6 w-full max-w-6xl px-4 sm:px-6 lg:px-8">
			<div className="grid items-center gap-8 overflow-hidden rounded-2xl border border-black/10 bg-white p-6 shadow-sm md:grid-cols-2 md:p-10">
				<div className="space-y-4">
						<Text
							field={headlineField}
							tag="h1"
							className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl"
						/>

					{introTextField && (
						<RichText
							field={introTextField}
							className="prose prose-sm max-w-none text-slate-700 sm:prose-base"
						/>
					)}

					{ctaField && (
						<Link
							field={ctaField}
							className="inline-flex items-center justify-center rounded-md bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
						/>
					)}
				</div>

				<div className="relative h-64 w-full overflow-hidden rounded-xl bg-slate-100 md:h-full md:min-h-80">
					{imageField ? (
						<Image
							field={imageField}
							className="h-full w-full object-cover"
						/>
					) : (
						<div className="h-full w-full bg-linear-to-br from-slate-200 to-slate-300" aria-hidden />
					)}
				</div>
			</div>
		</section>
	);
};

const HeroBanner = (props: HeroBannerProps): JSX.Element => <Intro {...props} />;

export default HeroBanner;
