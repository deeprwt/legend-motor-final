import android.app.ActivityManager
import android.content.Context
import android.util.Log
import com.clevertap.android.sdk.CleverTapAPI
import com.clevertap.android.sdk.pushnotification.fcm.CTFcmMessageHandler
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage

class MyFirebaseMessagingService : FirebaseMessagingService() {

    override fun onMessageReceived(message: RemoteMessage) {
        try {
            if (isAppInForeground(this)) {
                // Always show notification even if in foreground
                CTFcmMessageHandler().createNotification(applicationContext, message)
            } else {
                // Default behavior (background / killed)
                CTFcmMessageHandler().createNotification(applicationContext, message)
            }
        } catch (t: Throwable) {
            Log.d("MYFCMLIST", "Error parsing FCM message", t)
        }
    }

    override fun onNewToken(token: String) {
        CleverTapAPI.getDefaultInstance(this)?.pushFcmRegistrationId(token, true)
    }

    private fun isAppInForeground(context: Context): Boolean {
        val activityManager = context.getSystemService(Context.ACTIVITY_SERVICE) as ActivityManager
        val appProcesses = activityManager.runningAppProcesses
        val packageName = context.packageName

        appProcesses?.forEach {
            if (it.importance == ActivityManager.RunningAppProcessInfo.IMPORTANCE_FOREGROUND &&
                it.processName == packageName) {
                return true
            }
        }
        return false
    }
}
