import org.cef.CefApp;
import org.cef.CefClient;
import org.cef.CefSettings;
import org.cef.browser.CefBrowser;
import org.cef.browser.CefFrame;
import org.cef.handler.CefLifeSpanHandlerAdapter;
import org.cef.handler.CefLoadDialogHandler;
import org.cef.handler.CefLoadDialogHandlerAdapter;
import org.cef.handler.CefLoadHandler;
import org.cef.handler.CefLoadHandlerAdapter;
import org.cef.handler.CefRenderProcessHandler;
import org.cef.handler.CefRenderProcessHandlerAdapter;
import org.cef.handler.CefDisplayHandler;
import org.cef.handler.CefDisplayHandlerAdapter;
import org.cef.misc.BoolRef;
import org.cef.misc.IntRef;
import org.cef.misc.StringRef;
import org.cef.OS;

import javax.swing.*;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.util.HashMap;
import java.util.Map;
import java.util.Vector;

public class BookBlitz {

    private static CefApp cefApp;
    private static CefClient cefClient;
    private static CefBrowser cefBrowser;
    private static JFrame frame;
    private static JPanel browserPanel;

    public static void main(String[] args) {
      
        if (OS.isWindows()) {
          
            System.setProperty("jcef.nativesdir", "C:\Users\Matthew\jcef\native\libraries"); 
        }

        // Initialize JCEF
        CefSettings settings = new CefSettings();
        settings.windowless_rendering_enabled = false; 
        CefApp.getInstance(settings);
        cefApp = CefApp.getInstance(settings);

        cefClient = cefApp.createClient();

   
        cefBrowser = cefClient.createBrowser("", false, false);

        frame = new JFrame("JCEF Web Displayer");
        frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        // Make the frame full-screen
        frame.setExtendedState(JFrame.MAXIMIZED_BOTH);
        frame.setUndecorated(true); 

  
        browserPanel = new JPanel();
        browserPanel.setLayout(new BorderLayout());


        Component comp = cefBrowser.getUIComponent();
        browserPanel.add(comp, BorderLayout.CENTER);

        // Add a simple address bar
        JPanel controlPanel = new JPanel();
        JTextField addressBar = new JTextField("https://bookblitz.vercel.app/sign-in"); 
        addressBar.setPreferredSize(new Dimension(600, 30));
        controlPanel.add(addressBar);

        JButton goButton = new JButton("Go");
        goButton.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                cefBrowser.loadURL(addressBar.getText());
            }
        });
        controlPanel.add(goButton);
        frame.add(controlPanel, BorderLayout.NORTH);

        frame.add(browserPanel, BorderLayout.CENTER);

      
        setHandlers();

        frame.setVisible(true);
        cefBrowser.loadURL("https://bookblitz.vercel.app/sign-in"); // Load initial URL
    }

    private static void setHandlers() {
        // Set a life span handler to control popup windows.
        cefClient.addLifeSpanHandler(new CefLifeSpanHandlerAdapter() {
            @Override
            public boolean onBeforePopup(CefBrowser browser, CefFrame frame, String target_url,
                                         String target_frame_name, CefWindowInfo cefWindowInfo,
                                         CefBrowserSettings cefBrowserSettings, BoolRef no_javascript_access,
                                         BoolRef is_navigation, BoolRef is_popup) {
                // Return true to cancel the popup.  
                System.out.println("onBeforePopup: " + target_url);
                return true;  //suppress popup
            }

            @Override
            public void onAfterCreated(CefBrowser browser) {
                super.onAfterCreated(browser);
                System.out.println("onAfterCreated");
            }

            @Override
            public boolean doClose(CefBrowser browser) {
                System.out.println("doClose");
                return false;
            }

            @Override
            public void onBeforeClose(CefBrowser browser) {
                System.out.println("onBeforeClose");
            }
        });

       
        cefClient.addLoadHandler(new CefLoadHandlerAdapter() {
            @Override
            public void onLoadingStart(CefBrowser browser, CefFrame frame) {
                System.out.println("onLoadingStart: " + frame.getURL());
            }

            @Override
            public void onLoadingEnd(CefBrowser browser, CefFrame frame, int httpStatusCode) {
                System.out.println("onLoadingEnd: " + frame.getURL() + " with status " + httpStatusCode);
            }

            @Override
            public void onLoadingError(CefBrowser browser, CefFrame frame,
                                        CefLoadHandler.ErrorCode errorCode, String errorText,
                                        String failedUrl) {
                System.out.println("onLoadingError: " + errorText + " for URL " + failedUrl);
            }

            @Override
            public void onLoadProcessStarted(CefBrowser browser, CefFrame frame, int processId) {
                System.out.println("onLoadProcessStarted:" + processId);
            }

            @Override
            public void onLoadProcessTerminated(CefBrowser browser, CefFrame frame, int processId) {
                System.out.println("onLoadProcessTerminated:" + processId);
            }
        });

    
        cefClient.addDisplayHandler(new CefDisplayHandlerAdapter() {
            @Override
            public void onTitleChange(CefBrowser browser, String title) {
                System.out.println("Title changed: " + title);
                frame.setTitle(title); 
            }
        });

        cefClient.addLoadDialogHandler(new CefLoadDialogHandlerAdapter() {
            @Override
            public void onShowDialog(CefBrowser browser, String title, String message) {
                System.out.println("Load Dialog Shown: Title: " + title + "Bookblitz App " + message);
            }
        });
    }
}
