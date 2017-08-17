package com.telldus.live.mobile.test;

import android.app.Activity;
import android.app.AlertDialog;
import android.app.Dialog;
import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Typeface;
import android.net.Uri;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.RemoteViews;
import android.widget.TextView;

import org.json.JSONObject;

/**
 * The configuration screen for the {@link ConfigurableSensorWidget ConfigurableSensorWidget} AppWidget.
 */
public class ConfigurableSensorWidgetConfigureActivity extends Activity {
    int mAppWidgetId = AppWidgetManager.INVALID_APPWIDGET_ID;
    private EditText etUrl;
    private Button btAdd;
    private View btSelectSensor, btSelectDisplayItem;
    private TextView sensorName, sensorHint, sensorDataName, sensorDataHint;
    private ImageView imgSensorType;
    private AppWidgetManager widgetManager;
    private RemoteViews views;

    CharSequence sensorList[] = new CharSequence[] {"Outdoor Temp", "Indoor Temp", "Fridge", "Freezer"};
    CharSequence sensorDataList[] = new CharSequence[] {"Temperature", "Humidity", "Wind", "Rain"};

    @Override
    public void onCreate(Bundle icicle) {
        super.onCreate(icicle);
        setResult(RESULT_CANCELED);
        // activity stuffs
        setContentView(R.layout.activity_sensor_widget_configure);
        Typeface font = Typeface.createFromAsset(getAssets(), "fonts/telldusicons.ttf");
        etUrl = (EditText) findViewById(R.id.etUrl);
        widgetManager = AppWidgetManager.getInstance(this);
        views = new RemoteViews(this.getPackageName(), R.layout.configurable_sensor_widget);
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
        sensorName = (TextView) findViewById(R.id.txtSensorName);
        sensorHint = (TextView) findViewById(R.id.txtSensorHint);
        sensorDataName = (TextView) findViewById(R.id.txtSensorDataName);
        sensorDataHint = (TextView) findViewById(R.id.txtSensorDataHint);
        imgSensorType = (ImageView) findViewById(R.id.imgSensorType);
        btAdd = (Button) findViewById(R.id.btAdd);
        btAdd.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                // Gets user input
                Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(etUrl.getText().toString()));
                PendingIntent pending = PendingIntent.getActivity(ConfigurableSensorWidgetConfigureActivity.this, 0, intent, 0);
                views.setOnClickPendingIntent(R.id.iconWidget, pending);
                views.setTextViewText(R.id.txtSensorType, sensorName.getText());
                views.setImageViewResource(R.id.iconSensor, R.drawable.sensor);
                widgetManager.updateAppWidget(mAppWidgetId, views);
                Intent resultValue = new Intent();
                // Set the results as expected from a 'configure activity'.
                resultValue.putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, mAppWidgetId);
                setResult(RESULT_OK, resultValue);
                finish();
            }
        });
        btSelectSensor = (View) findViewById(R.id.btSelectSensor);
        btSelectSensor.setOnClickListener(new View.OnClickListener() {
            public int checkedItem;

            @Override
            public void onClick(View view) {
                AlertDialog.Builder builder = new AlertDialog.Builder(ConfigurableSensorWidgetConfigureActivity.this);
                builder.setTitle(R.string.pick_sensor)
                        .setSingleChoiceItems(sensorList, checkedItem, new DialogInterface.OnClickListener() {
                            @Override
                            public void onClick(DialogInterface dialog, int which) {
                                sensorName.setText(sensorList[which]);
                                sensorHint.setText(null);
                            }
                        });
                builder.show();
            }
        });
        btSelectDisplayItem = (View) findViewById(R.id.btSelectDisplayItem);
        btSelectDisplayItem.setOnClickListener(new View.OnClickListener() {
            public int checkedItem;

            @Override
            public void onClick(View view) {
                AlertDialog.Builder builder = new AlertDialog.Builder(ConfigurableSensorWidgetConfigureActivity.this);
                builder.setTitle(R.string.pick_sensor_data)
                        .setSingleChoiceItems(sensorDataList, checkedItem, new DialogInterface.OnClickListener() {
                            @Override
                            public void onClick(DialogInterface dialogInterface, int i) {
                                sensorDataName.setText(sensorDataList[i]);
                                sensorDataHint.setText(null);
                            }
                        });
                builder.show();
            }
        });
    }
}

