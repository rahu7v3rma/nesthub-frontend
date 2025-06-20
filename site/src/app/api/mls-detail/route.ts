import { NextResponse } from 'next/server';

const API_BASE_URL = 'https://api.realestateapi.com/v2';
const API_KEY = process.env.NEXT_PUBLIC_REALESTATE_API_KEY;

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const response = await fetch(`${API_BASE_URL}/MLSDetail`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'x-api-key': API_KEY || '',
        'x-user-id': 'UniqueUserIdentifier',
      },
      body: JSON.stringify({
        listing_id: body.listing_id,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: error.message || 'API request failed' },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
