import { NextRequest, NextResponse } from 'next/server';

type DemoSearchItem = {
  id: string;
  title: string;
  category: string;
  excerpt: string;
  url: string;
};

const DEMO_ITEMS: DemoSearchItem[] = [
  {
    id: 'mkt-1',
    title: 'Summer campaign landing framework',
    category: 'marketing',
    excerpt: 'Hero + feature grid + CTA composition for launch campaigns.',
    url: '/campaigns/summer-framework',
  },
  {
    id: 'mkt-2',
    title: 'Partner enablement toolkit',
    category: 'marketing',
    excerpt: 'Channel playbook layout for partner acquisition and co-marketing.',
    url: '/campaigns/partner-toolkit',
  },
  {
    id: 'edt-1',
    title: 'Editorial style guide 2026',
    category: 'editorial',
    excerpt: 'Long-form article template and voice/tone recommendations.',
    url: '/insights/editorial-style-guide-2026',
  },
  {
    id: 'edt-2',
    title: 'How to structure product explainers',
    category: 'editorial',
    excerpt: 'Practical article model for technical storytelling pages.',
    url: '/insights/product-explainers',
  },
  {
    id: 'prd-1',
    title: 'SYNC One headset',
    category: 'product',
    excerpt: 'Noise-controlled headset with adaptive room calibration.',
    url: '/products/sync-one',
  },
  {
    id: 'prd-2',
    title: 'SYNC Pro speaker',
    category: 'product',
    excerpt: 'Reference speaker with low-latency wireless profile switching.',
    url: '/products/sync-pro-speaker',
  },
];

/**
 * Demo search endpoint for realistic component prototyping.
 *
 * @param {NextRequest} request Incoming request with query parameters.
 * @returns {Promise<NextResponse>} Filtered item payload.
 */
export const GET = async (request: NextRequest): Promise<NextResponse> => {
  const query = request.nextUrl.searchParams.get('q')?.toLowerCase() ?? '';
  const category = request.nextUrl.searchParams.get('category')?.toLowerCase() ?? 'all';
  const sort = request.nextUrl.searchParams.get('sort')?.toLowerCase() ?? 'relevance';
  const pageParam = Number(request.nextUrl.searchParams.get('page') ?? '1');
  const pageSizeParam = Number(request.nextUrl.searchParams.get('pageSize') ?? '6');
  const page = Number.isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;
  const pageSize = Number.isNaN(pageSizeParam) || pageSizeParam < 1 ? 6 : pageSizeParam;

  const filteredItems = DEMO_ITEMS.filter((item) => {
    const matchesCategory = category === 'all' || item.category === category;
    const matchesQuery =
      !query ||
      item.title.toLowerCase().includes(query) ||
      item.excerpt.toLowerCase().includes(query);

    return matchesCategory && matchesQuery;
  });

  const sortedItems = [...filteredItems].sort((left, right) => {
    if (sort === 'title-asc') {
      return left.title.localeCompare(right.title);
    }
    if (sort === 'title-desc') {
      return right.title.localeCompare(left.title);
    }
    return 0;
  });

  const start = (page - 1) * pageSize;
  const items = sortedItems.slice(start, start + pageSize);
  const total = sortedItems.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return NextResponse.json({
    items,
    total,
    page,
    pageSize,
    totalPages,
  });
};
