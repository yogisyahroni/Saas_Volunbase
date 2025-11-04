exports.handler = async (event) => {
  try {
    const body = event && event.body ? JSON.parse(event.body) : {};
    const { eventId, shiftId, volunteerName, volunteerEmail } = body;
    if (!eventId || !shiftId || !volunteerName || !volunteerEmail) {
      return { statusCode: 400, body: JSON.stringify({ error: 'BAD_REQUEST' }) };
    }
    // TODO: Integrate with DynamoDB TransactWrite + SES confirmation (future refactor)
    return {
      statusCode: 200,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ok: true, received: { eventId, shiftId, volunteerName, volunteerEmail } }),
    };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: 'INTERNAL_ERROR' }) };
  }
};

