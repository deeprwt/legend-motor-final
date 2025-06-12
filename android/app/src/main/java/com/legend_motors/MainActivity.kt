package com.lhgl.LegendCarTradingCustomer

import android.content.Intent
import android.os.Build
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import com.clevertap.android.sdk.CleverTapAPI

class MainActivity : ReactActivity() {

    /**
     * Returns the name of the main component registered from JavaScript. This is used to schedule
     * rendering of the component.
     */
    override fun getMainComponentName(): String = "legend_motors"

    /**
     * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
     * which allows you to enable New Architecture with a single boolean flag [fabricEnabled].
     */
    override fun createReactActivityDelegate(): ReactActivityDelegate =
        DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

    override fun onNewIntent(intent: Intent?) {
        super.onNewIntent(intent)

        // On Android 12 and onwards, raise notification clicked event and get the click callback
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            intent?.extras?.let { extras ->
                val cleverTapDefaultInstance = CleverTapAPI.getDefaultInstance(applicationContext)
                cleverTapDefaultInstance?.pushNotificationClickedEvent(extras)
            }
        }
    }
}
