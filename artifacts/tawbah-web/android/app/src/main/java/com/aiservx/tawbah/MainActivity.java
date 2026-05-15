package com.aiservx.tawbah;

import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.WindowInsets;
import android.view.WindowInsetsController;
import android.webkit.WebView;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    setTheme(R.style.AppTheme_NoActionBar);
    registerPlugin(SystemBarsPlugin.class);
    super.onCreate(savedInstanceState);

    // Configure WebView after bridge is initialized
    WebView webView = getBridge().getWebView();
    if (webView != null) {
      webView.getSettings().setUseWideViewPort(true);
      webView.getSettings().setLoadWithOverviewMode(true);
      webView.getSettings().setAllowFileAccess(true);
      webView.getSettings().setAllowContentAccess(true);
    }

    // Show status bar and navigation bar
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
      final WindowInsetsController controller = getWindow().getInsetsController();
      if (controller != null) {
        controller.show(WindowInsets.Type.statusBars() | WindowInsets.Type.navigationBars());
      }
    } else {
      final View decorView = getWindow().getDecorView();
      decorView.setSystemUiVisibility(
          View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
              | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
              | View.SYSTEM_UI_FLAG_LAYOUT_STABLE
      );
    }
  }
}
