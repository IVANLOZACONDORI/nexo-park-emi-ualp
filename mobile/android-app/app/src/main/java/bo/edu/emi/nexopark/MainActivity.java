package bo.edu.emi.nexopark;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.app.AlertDialog;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.provider.Settings;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.CookieManager;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

public class MainActivity extends Activity {
    private static final String PREFS = "nexo_park";
    private static final String SERVER = "server_url";
    private static final int FILE_CHOOSER = 2106;
    private WebView webView;
    private ValueCallback<Uri[]> fileCallback;
    private SharedPreferences prefs;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        prefs = getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        createWebView();
        String server = prefs.getString(SERVER, "");
        if (server == null || server.trim().isEmpty()) showServerDialog(false);
        else openApp(server);
    }

    @SuppressLint("SetJavaScriptEnabled")
    private void createWebView() {
        webView = new WebView(this);
        webView.setBackgroundColor(Color.rgb(243, 247, 248));
        WebSettings s = webView.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setLoadWithOverviewMode(true);
        s.setUseWideViewPort(true);
        s.setBuiltInZoomControls(false);
        s.setDisplayZoomControls(false);
        s.setMixedContentMode(WebSettings.MIXED_CONTENT_COMPATIBILITY_MODE);
        s.setUserAgentString(s.getUserAgentString() + " NEXOPARK-Android/36.2");
        CookieManager.getInstance().setAcceptCookie(true);
        CookieManager.getInstance().setAcceptThirdPartyCookies(webView, true);

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                String scheme = uri.getScheme();
                if ("http".equalsIgnoreCase(scheme) || "https".equalsIgnoreCase(scheme)) return false;
                try { startActivity(new Intent(Intent.ACTION_VIEW, uri)); } catch (Exception ignored) {}
                return true;
            }

            @Override
            public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                if (request.isForMainFrame()) showConnectionError();
            }
        });

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onShowFileChooser(WebView webView, ValueCallback<Uri[]> callback, FileChooserParams params) {
                if (fileCallback != null) fileCallback.onReceiveValue(null);
                fileCallback = callback;
                try {
                    Intent intent = params.createIntent();
                    startActivityForResult(intent, FILE_CHOOSER);
                    return true;
                } catch (Exception e) {
                    fileCallback = null;
                    Toast.makeText(MainActivity.this, "No se pudo abrir el selector de archivos.", Toast.LENGTH_SHORT).show();
                    return false;
                }
            }
        });

        webView.setOnLongClickListener(v -> {
            showServerDialog(true);
            return true;
        });
        setContentView(webView);
    }

    private String normalizeServer(String value) {
        String s = value == null ? "" : value.trim();
        if (!s.startsWith("http://") && !s.startsWith("https://")) s = "http://" + s;
        while (s.endsWith("/")) s = s.substring(0, s.length() - 1);
        return s;
    }

    private void openApp(String server) {
        String normalized = normalizeServer(server);
        prefs.edit().putString(SERVER, normalized).apply();
        webView.loadUrl(normalized + "/login?next=/movil");
    }

    private void showServerDialog(boolean canCancel) {
        LinearLayout box = new LinearLayout(this);
        box.setOrientation(LinearLayout.VERTICAL);
        int pad = (int) (20 * getResources().getDisplayMetrics().density);
        box.setPadding(pad, pad / 2, pad, 0);

        TextView help = new TextView(this);
        help.setText("Indica la dirección del servidor NEXO PARK. Si el sistema está ejecutándose en una computadora de la misma red Wi‑Fi, usa por ejemplo: http://192.168.1.25:4000");
        help.setTextSize(15);
        help.setTextColor(Color.rgb(70, 90, 105));
        help.setPadding(0, 0, 0, pad / 2);
        box.addView(help);

        EditText input = new EditText(this);
        input.setSingleLine(true);
        input.setHint("http://192.168.1.25:4000");
        input.setText(prefs.getString(SERVER, ""));
        box.addView(input, new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT));

        AlertDialog dialog = new AlertDialog.Builder(this)
                .setTitle("Conectar con NEXO PARK")
                .setView(box)
                .setCancelable(canCancel)
                .setPositiveButton("Conectar", null)
                .setNegativeButton(canCancel ? "Cancelar" : "Salir", (d, which) -> { if (!canCancel) finish(); })
                .create();
        dialog.setOnShowListener(v -> dialog.getButton(AlertDialog.BUTTON_POSITIVE).setOnClickListener(btn -> {
            String server = input.getText().toString().trim();
            if (server.isEmpty()) {
                input.setError("Ingrese la dirección del servidor.");
                return;
            }
            dialog.dismiss();
            openApp(server);
        }));
        dialog.show();
    }

    private void showConnectionError() {
        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setGravity(Gravity.CENTER);
        int pad = (int) (28 * getResources().getDisplayMetrics().density);
        root.setPadding(pad, pad, pad, pad);
        root.setBackgroundColor(Color.rgb(243,247,248));

        TextView title = new TextView(this);
        title.setText("No se pudo conectar con NEXO PARK");
        title.setTextSize(24);
        title.setTextColor(Color.rgb(8,45,67));
        title.setGravity(Gravity.CENTER);
        root.addView(title);

        TextView info = new TextView(this);
        info.setText("Comprueba que el servidor esté iniciado y que el celular esté en la misma red. Mantén presionada esta pantalla para cambiar la dirección del servidor.");
        info.setTextSize(16);
        info.setGravity(Gravity.CENTER);
        info.setTextColor(Color.rgb(95,118,134));
        info.setPadding(0,pad/2,0,0);
        root.addView(info);
        root.setOnLongClickListener(v -> { showServerDialog(true); return true; });
        setContentView(root);
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) webView.goBack();
        else super.onBackPressed();
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == FILE_CHOOSER && fileCallback != null) {
            Uri[] result = null;
            if (resultCode == RESULT_OK) result = WebChromeClient.FileChooserParams.parseResult(resultCode, data);
            fileCallback.onReceiveValue(result);
            fileCallback = null;
        }
    }
}
