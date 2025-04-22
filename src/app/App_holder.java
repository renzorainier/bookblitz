
import org.cef.CefApp;
import org.cef.CefClient;
import org.cef.browser.CefBrowser;
import org.cef.handler.CefLifeSpanHandlerAdapter;
import org.cef.OS;

import javax.swing.*;
import java.awt.*;

public class JcefExample {
    public static void main(String[] args) {
        // Initialize JCEF
        CefApp cefApp = CefApp.getInstance();
        CefClient client = cefApp.createClient();

        // Create a browser instance with a URL
        CefBrowser browser = client.createBrowser
        ("https://link_of_app_will_be_placed_here", false, false);

        // Create a Swing frame
        JFrame frame = new JFrame("JCEF Browser Example");
        frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        frame.setSize(1024, 768);
        frame.setLayout(new BorderLayout());

        // Add JCEF browser component to JFrame
        frame.add(browser.getUIComponent(), BorderLayout.CENTER);
        frame.setVisible(true);

        // Handle close operation
        client.addLifeSpanHandler(new CefLifeSpanHandlerAdapter() {
            @Override
            public void onBeforeClose(CefBrowser browser) {
                CefApp.getInstance().dispose();
            }
        });
    }
}



