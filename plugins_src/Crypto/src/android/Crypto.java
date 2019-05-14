package dev.haigh;

import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CallbackContext;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import com.tozny.crypto.android.AesCbcWithIntegrity;
import android.util.Log;

/**
 * This class echoes a string called from JavaScript.
 */
public class Crypto extends CordovaPlugin {

    @Override
    public boolean execute(String action, JSONArray argArray, CallbackContext callbackContext) throws JSONException {
		JSONObject args = argArray.getJSONObject(0);
        if (action.equals("encrypt")) {
            String message = args.getString("plaintext") + "\0";
			String keys = args.getString("keys");
            this.encrypt(message, keys, callbackContext);
            return true;
        }
		else if(action.equals("decrypt")) {
            String message = args.getString("cipher");
			String keys = args.getString("keys");
			this.decrypt(message, keys, callbackContext);
			return true;
		} else if(action.equals("generateKeys")){
			this.generateKeys(callbackContext);
		}
        return false;
    }

    private void encrypt(String message, String keystr, CallbackContext callbackContext) {
        if (message != null && message.length() > 0) {
			try{
				AesCbcWithIntegrity.SecretKeys keys = AesCbcWithIntegrity.keys(keystr);
				callbackContext.success(AesCbcWithIntegrity.encrypt(message, keys).toString());
			} catch (Exception e){
				Log.e("ENCRYPT", e.getMessage());
				callbackContext.error(e.getMessage());
			}
        } else {
            callbackContext.error("Expected one non-empty string argument.");
        }
    }

    private void decrypt(String message, String keystr, CallbackContext callbackContext) {
		try{
			AesCbcWithIntegrity.SecretKeys keys = AesCbcWithIntegrity.keys(keystr);
			AesCbcWithIntegrity.CipherTextIvMac cipher = new AesCbcWithIntegrity.CipherTextIvMac(message);
			callbackContext.success(AesCbcWithIntegrity.decryptString(cipher,keys));
		} catch (Exception e){
			callbackContext.error(e.getMessage());
		}
	}

	private void generateKeys(CallbackContext cb){
		try{
			cb.success(AesCbcWithIntegrity.keyString(AesCbcWithIntegrity.generateKey()));
		} catch (Exception e) {
			cb.error(e.getMessage());
		}
	}

}
