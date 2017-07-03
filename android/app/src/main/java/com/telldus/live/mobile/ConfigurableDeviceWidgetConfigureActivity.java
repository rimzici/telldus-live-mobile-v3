package com.telldus.live.mobile.test;

import android.app.Activity;
import android.app.AlertDialog;
import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.content.DialogInterface;
import android.content.Intent;
import android.graphics.Typeface;
import android.net.Uri;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.RemoteViews;
import android.widget.TextView;

/**
 * The configuration screen for the {@link ConfigurableDeviceWidget ConfigurableDeviceWidget} AppWidget.
 */
public class ConfigurableDeviceWidgetConfigureActivity extends Activity {
    int mAppWidgetId = AppWidgetManager.INVALID_APPWIDGET_ID;
    private EditText etUrl;
    private Button btAdd;
    private View btSelectDevice;
    TextView deviceName, deviceHint, deviceOn, deviceOff;
    private AppWidgetManager widgetManager;
    private RemoteViews views;

    CharSequence deviceList[] = new CharSequence[] {"Light Dimmer", "Livingroom Lights", "Kitchen", "Outdoor Lights"};
    @Override
    public void onCreate(Bundle icicle) {
        super.onCreate(icicle);
        setResult(RESULT_CANCELED);
        // activity stuffs
        setContentView(R.layout.activity_device_widget_configure);
        Typeface font = Typeface.createFromAsset(getAssets(), "fonts/telldusicons.ttf");
        etUrl = (EditText) findViewById(R.id.etUrl);
        widgetManager = AppWidgetManager.getInstance(this);
        views = new RemoteViews(this.getPackageName(), R.layout.configurable_device_widget);
        // Find the widget id from the intent.
        Intent intent = getIntent();
        Bundle extras = intent.getExtras();
        if (extras != null) {
            mAppWidgetId = extras.getInt(AppWidgetManager.EXTRA_APPWIDGET_ID, AppWidgetManager.INVALID_APPWIDGET_ID);
        }
        if (mAppWidgetId == AppWidgetManager.INVALID_APPWIDGET_ID) {
            finish();
            return;
        }
        deviceName = (TextView) findViewById(R.id.txtDeviceName);
        deviceHint = (TextView) findViewById(R.id.txtDeviceHint);
//        deviceOn = (TextView) findViewById(R.id.txtDeviceOn);
//        deviceOff = (TextView) findViewById(R.id.txtDeviceOff);
//        deviceOn.setTypeface(font);
//        deviceOff.setTypeface(font);
//        TextView testTxt;
//        testTxt = (TextView) findViewById(R.id.testText);
//        testTxt.setTypeface(font);
//        testTxt.setText("&#xe91c;");
        btAdd = (Button) findViewById(R.id.btAdd);
        btAdd.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                // Gets user input
                Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(etUrl.getText().toString()));
                PendingIntent pending = PendingIntent.getActivity(ConfigurableDeviceWidgetConfigureActivity.this, 0, intent, 0);
                views.setOnClickPendingIntent(R.id.iconWidget, pending);
                views.setTextViewText(R.id.txtWidgetTitle, deviceName.getText());
                widgetManager.updateAppWidget(mAppWidgetId, views);
                Intent resultValue = new Intent();
                // Set the results as expected from a 'configure activity'.
                resultValue.putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, mAppWidgetId);
                setResult(RESULT_OK, resultValue);
                finish();
            }
        });
        btSelectDevice = (View) findViewById(R.id.btSelectDevice);
        btSelectDevice.setOnClickListener(new View.OnClickListener() {
            public int checkedItem;

            public void onClick(View view) {
                AlertDialog.Builder builder = new AlertDialog.Builder(ConfigurableDeviceWidgetConfigureActivity.this);
                builder.setTitle(R.string.pick_device)
                        .setSingleChoiceItems(deviceList, checkedItem, new DialogInterface.OnClickListener() {
                            public void onClick(DialogInterface dialog, int which) {
                                deviceName.setText(deviceList[which]);
                                deviceHint.setText(null);
                            }
                        });
                builder.show();
            }
        });
    }
}
