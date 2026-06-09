const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const admin = require('firebase-admin');

admin.initializeApp();

function getAdminTokens() {
  const raw = process.env.ADMIN_FCM_TOKENS || '';
  return raw.split(',').map(t => t.trim()).filter(Boolean);
}

exports.notifyNewQaPost = onDocumentCreated('qa_posts/{postId}', async (event) => {
  const snap = event.data;
  if (!snap) return;

  const post = snap.data() || {};
  const tokens = getAdminTokens();
  if (!tokens.length) {
    await snap.ref.set({ notifyStatus: 'no_admin_token' }, { merge: true });
    return;
  }

  const category = String(post.category || '문의');
  const safeTitle = String(post.title || '새 문의·건의').slice(0, 40);

  const message = {
    tokens,
    notification: {
      title: '가톨릭길동무 새 문의·건의',
      body: `[${category}] ${safeTitle}`
    },
    data: {
      type: 'qa_post',
      postId: snap.id,
      category
    }
  };

  const res = await admin.messaging().sendEachForMulticast(message);
  await snap.ref.set({
    notifyStatus: res.failureCount ? 'partial_or_failed' : 'sent',
    notifySuccessCount: res.successCount,
    notifyFailureCount: res.failureCount,
    notifiedAt: admin.firestore.FieldValue.serverTimestamp()
  }, { merge: true });
});
