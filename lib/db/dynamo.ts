import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, TransactWriteCommand, ScanCommand, QueryCommand, PutCommand, DeleteCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { prefixKey } from '@/lib/tenancy';

function getClient() {
  const region = process.env.AWS_REGION || 'us-east-1';
  const ddb = new DynamoDBClient({ region });
  return DynamoDBDocumentClient.from(ddb);
}

const TABLE = process.env.DYNAMO_TABLE || 'VolunbaseTable';

export async function registerVolunteerAtomic(params: {
  tenantId: string;
  eventId: string;
  shiftId: string;
  volunteerName: string;
  volunteerEmail: string;
}) {
  const { tenantId, eventId, shiftId, volunteerEmail, volunteerName } = params;
  const doc = getClient();
  const now = new Date().toISOString();
  const regId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  // Keys according to ERD (prefixed by tenant)
  const pkEvent = prefixKey(tenantId, `EVENT#${eventId}`);
  const skReg = `REGISTRATION#${regId}`;
  const skShift = `SHIFT#${shiftId}`;

  try {
    await doc.send(
      new TransactWriteCommand({
        TransactItems: [
          {
            Put: {
              TableName: TABLE,
              Item: {
                PK: pkEvent,
                SK: skReg,
                Type: 'Registration',
                volunteerName,
                volunteerEmail,
                shiftId,
                createdAt: now,
              },
              ConditionExpression: 'attribute_not_exists(PK) AND attribute_not_exists(SK)',
            },
          },
          {
            Update: {
              TableName: TABLE,
              Key: { PK: pkEvent, SK: skShift },
              UpdateExpression: 'SET slotsFilled = if_not_exists(slotsFilled, :z) + :one',
              ConditionExpression: 'attribute_exists(PK) AND attribute_exists(SK) AND (slotsFilled < slotsNeeded)',
              ExpressionAttributeValues: { ':one': 1, ':z': 0 },
            },
          },
        ],
      })
    );

    return { ok: true, registrationId: regId } as const;
  } catch (e: any) {
    const msg = (e && e.message) || String(e);
    if (msg.includes('ConditionalCheckFailed')) {
      return { ok: false, reason: 'FULL' } as const;
    }
    return { ok: false, reason: 'ERROR', message: msg } as const;
  }
}

export async function scanShiftsBetween(params: {
  tenantId: string;
  startIso: string;
  endIso: string;
}) {
  const { tenantId, startIso, endIso } = params;
  const doc = getClient();
  const pkPrefix = prefixKey(tenantId, 'EVENT#');

  const res = await doc.send(
    new ScanCommand({
      TableName: TABLE,
      FilterExpression:
        'begins_with(#pk, :pkpref) AND begins_with(#sk, :skpref) AND #type = :shift AND #start BETWEEN :start AND :end',
      ExpressionAttributeNames: {
        '#pk': 'PK',
        '#sk': 'SK',
        '#type': 'Type',
        '#start': 'startTime',
      },
      ExpressionAttributeValues: {
        ':pkpref': pkPrefix,
        ':skpref': 'SHIFT#',
        ':shift': 'Shift',
        ':start': startIso,
        ':end': endIso,
      },
    })
  );

  return (res.Items || []).map((it) => ({
    PK: it.PK as string,
    SK: it.SK as string,
    eventId: String((it.PK as string).split('EVENT#')[1] || ''),
    shiftId: String((it.SK as string).split('SHIFT#')[1] || ''),
    startTime: it.startTime as string,
  }));
}

export async function listRegistrationsForShift(params: {
  tenantId: string;
  eventId: string;
  shiftId: string;
}) {
  const { tenantId, eventId, shiftId } = params;
  const doc = getClient();
  const pkEvent = prefixKey(tenantId, `EVENT#${eventId}`);

  const res = await doc.send(
    new QueryCommand({
      TableName: TABLE,
      KeyConditionExpression: '#pk = :pk',
      FilterExpression: 'begins_with(#sk, :skpref) AND #shiftId = :shiftId',
      ExpressionAttributeNames: {
        '#pk': 'PK',
        '#sk': 'SK',
        '#shiftId': 'shiftId',
      },
      ExpressionAttributeValues: {
        ':pk': pkEvent,
        ':skpref': 'REGISTRATION#',
        ':shiftId': shiftId,
      },
    })
  );

  return (res.Items || []).map((it) => ({
    volunteerName: it.volunteerName as string,
    volunteerEmail: it.volunteerEmail as string,
    registrationId: (it.SK as string).split('REGISTRATION#')[1] || '',
  }));
}

// ===== Events CRUD =====
export async function createEventItem(params: {
  tenantId: string;
  userId: string;
  eventId: string;
  eventName: string;
  status?: string;
  publicSlug?: string;
}) {
  const { tenantId, userId, eventId, eventName, status = 'draft', publicSlug } = params;
  const doc = getClient();
  const pkUser = prefixKey(tenantId, `USER#${userId}`);
  const pkEvent = prefixKey(tenantId, `EVENT#${eventId}`);
  const now = new Date().toISOString();
  // Write user-scoped event item and event-meta item under EVENT# partition for public lookup
  await doc.send(
    new TransactWriteCommand({
      TransactItems: [
        {
          Put: {
            TableName: TABLE,
            Item: {
              PK: pkUser,
              SK: `EVENT#${eventId}`,
              Type: 'Event',
              eventId,
              eventName,
              status,
              publicSlug,
              updatedAt: now,
            },
            ConditionExpression: 'attribute_not_exists(PK) AND attribute_not_exists(SK)'
          },
        },
        {
          Put: {
            TableName: TABLE,
            Item: {
              PK: pkEvent,
              SK: 'EVENT',
              Type: 'EventMeta',
              eventId,
              eventName,
              status,
              publicSlug,
              updatedAt: now,
            },
            ConditionExpression: 'attribute_not_exists(PK) AND attribute_not_exists(SK)'
          },
        },
      ],
    })
  );
  return { ok: true as const };
}

export async function listEventsByUser(params: {
  tenantId: string;
  userId: string;
  limit?: number;
  cursor?: any;
  status?: string;
}) {
  const { tenantId, userId, limit = 20, cursor, status } = params;
  const doc = getClient();
  const pkUser = prefixKey(tenantId, `USER#${userId}`);
  const res = await doc.send(
    new QueryCommand({
      TableName: TABLE,
      KeyConditionExpression: '#pk = :pk AND begins_with(#sk, :skpref)',
      ExpressionAttributeNames: { '#pk': 'PK', '#sk': 'SK' },
      ExpressionAttributeValues: { ':pk': pkUser, ':skpref': 'EVENT#' },
      Limit: limit,
      ExclusiveStartKey: cursor || undefined,
    })
  );
  let items = (res.Items || []) as any[];
  if (status) items = items.filter((i) => i.status === status);
  return { items, cursor: res.LastEvaluatedKey || null };
}

export async function updateEventItem(params: {
  tenantId: string;
  userId: string;
  eventId: string;
  eventName?: string;
  status?: string;
  publicSlug?: string;
}) {
  const { tenantId, userId, eventId, eventName, status, publicSlug } = params;
  const doc = getClient();
  const pkUser = prefixKey(tenantId, `USER#${userId}`);
  const pkEvent = prefixKey(tenantId, `EVENT#${eventId}`);

  const sets: string[] = [];
  const names: Record<string, string> = { '#updatedAt': 'updatedAt' };
  const values: Record<string, any> = { ':updatedAt': new Date().toISOString() };
  if (eventName) { sets.push('#eventName = :eventName'); names['#eventName'] = 'eventName'; values[':eventName'] = eventName; }
  if (status) { sets.push('#status = :status'); names['#status'] = 'status'; values[':status'] = status; }
  if (publicSlug) { sets.push('#publicSlug = :slug'); names['#publicSlug'] = 'publicSlug'; values[':slug'] = publicSlug; }
  sets.push('#updatedAt = :updatedAt');

  await doc.send(
    new UpdateCommand({
      TableName: TABLE,
      Key: { PK: pkUser, SK: `EVENT#${eventId}` },
      UpdateExpression: 'SET ' + sets.join(', '),
      ExpressionAttributeNames: names,
      ExpressionAttributeValues: values,
      ConditionExpression: 'attribute_exists(PK) AND attribute_exists(SK)'
    })
  );
  // Mirror update to public EventMeta item
  await doc.send(
    new UpdateCommand({
      TableName: TABLE,
      Key: { PK: pkEvent, SK: 'EVENT' },
      UpdateExpression: 'SET ' + sets.join(', '),
      ExpressionAttributeNames: names,
      ExpressionAttributeValues: values,
    })
  );
  // Create slug mapping if provided
  if (publicSlug) {
    await doc.send(
      new PutCommand({
        TableName: TABLE,
        Item: { PK: prefixKey(tenantId, `SLUG#${publicSlug}`), SK: 'EVENT', eventId },
        ConditionExpression: 'attribute_not_exists(PK) AND attribute_not_exists(SK)'
      })
    );
  }
  return { ok: true as const };
}

export async function deleteEventItem(params: { tenantId: string; userId: string; eventId: string }) {
  const { tenantId, userId, eventId } = params;
  const doc = getClient();
  const pkUser = prefixKey(tenantId, `USER#${userId}`);
  await doc.send(
    new DeleteCommand({ TableName: TABLE, Key: { PK: pkUser, SK: `EVENT#${eventId}` } })
  );
  // Delete public meta (best-effort)
  await doc.send(new DeleteCommand({ TableName: TABLE, Key: { PK: prefixKey(tenantId, `EVENT#${eventId}`), SK: 'EVENT' } }));
  return { ok: true as const };
}

// ===== Shifts CRUD =====
export async function listShifts(params: { tenantId: string; eventId: string }) {
  const { tenantId, eventId } = params;
  const doc = getClient();
  const pkEvent = prefixKey(tenantId, `EVENT#${eventId}`);
  const res = await doc.send(
    new QueryCommand({
      TableName: TABLE,
      KeyConditionExpression: '#pk = :pk AND begins_with(#sk, :skpref)',
      ExpressionAttributeNames: { '#pk': 'PK', '#sk': 'SK' },
      ExpressionAttributeValues: { ':pk': pkEvent, ':skpref': 'SHIFT#' },
    })
  );
  return (res.Items || []) as any[];
}

export async function createShift(params: {
  tenantId: string;
  eventId: string;
  shiftId: string;
  shiftName: string;
  startTime: string;
  endTime?: string;
  slotsNeeded: number;
}) {
  const { tenantId, eventId, shiftId, shiftName, startTime, endTime, slotsNeeded } = params;
  const doc = getClient();
  const pkEvent = prefixKey(tenantId, `EVENT#${eventId}`);
  await doc.send(
    new PutCommand({
      TableName: TABLE,
      Item: {
        PK: pkEvent,
        SK: `SHIFT#${shiftId}`,
        Type: 'Shift',
        shiftId,
        shiftName,
        startTime,
        endTime,
        slotsNeeded,
        slotsFilled: 0,
        updatedAt: new Date().toISOString(),
      },
      ConditionExpression: 'attribute_not_exists(PK) AND attribute_not_exists(SK)'
    })
  );
  return { ok: true as const };
}

export async function updateShift(params: {
  tenantId: string;
  eventId: string;
  shiftId: string;
  shiftName?: string;
  startTime?: string;
  endTime?: string;
  slotsNeeded?: number;
}) {
  const { tenantId, eventId, shiftId, shiftName, startTime, endTime, slotsNeeded } = params;
  const doc = getClient();
  const pkEvent = prefixKey(tenantId, `EVENT#${eventId}`);
  const sets: string[] = ['#updatedAt = :updatedAt'];
  const names: Record<string, string> = { '#updatedAt': 'updatedAt' };
  const values: Record<string, any> = { ':updatedAt': new Date().toISOString() };
  if (shiftName) { sets.push('#shiftName = :name'); names['#shiftName'] = 'shiftName'; values[':name'] = shiftName; }
  if (startTime) { sets.push('#startTime = :start'); names['#startTime'] = 'startTime'; values[':start'] = startTime; }
  if (endTime) { sets.push('#endTime = :end'); names['#endTime'] = 'endTime'; values[':end'] = endTime; }
  if (typeof slotsNeeded === 'number') { sets.push('#slotsNeeded = :need'); names['#slotsNeeded'] = 'slotsNeeded'; values[':need'] = slotsNeeded; }

  await doc.send(
    new UpdateCommand({
      TableName: TABLE,
      Key: { PK: pkEvent, SK: `SHIFT#${shiftId}` },
      UpdateExpression: 'SET ' + sets.join(', '),
      ExpressionAttributeNames: names,
      ExpressionAttributeValues: values,
      ConditionExpression: 'attribute_exists(PK) AND attribute_exists(SK)'
    })
  );
  return { ok: true as const };
}

export async function deleteShift(params: { tenantId: string; eventId: string; shiftId: string }) {
  const { tenantId, eventId, shiftId } = params;
  const doc = getClient();
  const pkEvent = prefixKey(tenantId, `EVENT#${eventId}`);
  await doc.send(new DeleteCommand({ TableName: TABLE, Key: { PK: pkEvent, SK: `SHIFT#${shiftId}` } }));
  return { ok: true as const };
}

// ===== Public lookups =====
export async function getEventBySlug(params: { tenantId: string; slug: string }) {
  const { tenantId, slug } = params;
  const doc = getClient();
  const pkSlug = prefixKey(tenantId, `SLUG#${slug}`);
  const mapRes = await doc.send(
    new QueryCommand({
      TableName: TABLE,
      KeyConditionExpression: '#pk = :pk AND #sk = :sk',
      ExpressionAttributeNames: { '#pk': 'PK', '#sk': 'SK' },
      ExpressionAttributeValues: { ':pk': pkSlug, ':sk': 'EVENT' },
    })
  );
  const mapItem = (mapRes.Items || [])[0];
  if (!mapItem) return null;
  const eventId = mapItem.eventId as string;

  const pkEvent = prefixKey(tenantId, `EVENT#${eventId}`);
  const metaRes = await doc.send(
    new QueryCommand({
      TableName: TABLE,
      KeyConditionExpression: '#pk = :pk AND #sk = :sk',
      ExpressionAttributeNames: { '#pk': 'PK', '#sk': 'SK' },
      ExpressionAttributeValues: { ':pk': pkEvent, ':sk': 'EVENT' },
    })
  );
  const meta = (metaRes.Items || [])[0] as any;
  const shifts = await listShifts({ tenantId, eventId });
  return { eventId, eventName: meta?.eventName || '', status: meta?.status || 'draft', publicSlug: slug, shifts };
}

export async function getEventMeta(params: { tenantId: string; eventId: string }) {
  const { tenantId, eventId } = params;
  const doc = getClient();
  const pkEvent = prefixKey(tenantId, `EVENT#${eventId}`);
  const res = await doc.send(
    new QueryCommand({
      TableName: TABLE,
      KeyConditionExpression: '#pk = :pk AND #sk = :sk',
      ExpressionAttributeNames: { '#pk': 'PK', '#sk': 'SK' },
      ExpressionAttributeValues: { ':pk': pkEvent, ':sk': 'EVENT' },
    })
  );
  return (res.Items || [])[0] as any;
}

export async function getShift(params: { tenantId: string; eventId: string; shiftId: string }) {
  const { tenantId, eventId, shiftId } = params;
  const doc = getClient();
  const pkEvent = prefixKey(tenantId, `EVENT#${eventId}`);
  const res = await doc.send(
    new QueryCommand({
      TableName: TABLE,
      KeyConditionExpression: '#pk = :pk AND #sk = :sk',
      ExpressionAttributeNames: { '#pk': 'PK', '#sk': 'SK' },
      ExpressionAttributeValues: { ':pk': pkEvent, ':sk': `SHIFT#${shiftId}` },
    })
  );
  return (res.Items || [])[0] as any;
}

export async function setAdminTier(params: { tenantId: string; userId: string; tier: string }) {
  const { tenantId, userId, tier } = params;
  const doc = getClient();
  const pkUser = prefixKey(tenantId, `USER#${userId}`);
  await doc.send(
    new UpdateCommand({
      TableName: TABLE,
      Key: { PK: pkUser, SK: 'PROFILE' },
      UpdateExpression: 'SET #tier = :tier, #updatedAt = :now',
      ExpressionAttributeNames: { '#tier': 'subscription_tier', '#updatedAt': 'updatedAt' },
      ExpressionAttributeValues: { ':tier': tier, ':now': new Date().toISOString() },
    })
  );
  return { ok: true as const };
}

export async function getAdminProfile(params: { tenantId: string; userId: string }) {
  const { tenantId, userId } = params;
  const doc = getClient();
  const pkUser = prefixKey(tenantId, `USER#${userId}`);
  const res = await doc.send(
    new QueryCommand({
      TableName: TABLE,
      KeyConditionExpression: '#pk = :pk AND #sk = :sk',
      ExpressionAttributeNames: { '#pk': 'PK', '#sk': 'SK' },
      ExpressionAttributeValues: { ':pk': pkUser, ':sk': 'PROFILE' },
    })
  );
  return (res.Items || [])[0] as any;
}

export async function checkSlugExists(params: { tenantId: string; slug: string }) {
  const { tenantId, slug } = params;
  const doc = getClient();
  const pkSlug = prefixKey(tenantId, `SLUG#${slug}`);
  const res = await doc.send(
    new QueryCommand({
      TableName: TABLE,
      KeyConditionExpression: '#pk = :pk AND #sk = :sk',
      ExpressionAttributeNames: { '#pk': 'PK', '#sk': 'SK' },
      ExpressionAttributeValues: { ':pk': pkSlug, ':sk': 'EVENT' },
      Limit: 1,
    })
  );
  return (res.Items || []).length > 0;
}
