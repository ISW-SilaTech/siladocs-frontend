import React, { Fragment, useRef } from "react";
const SunEditor = dynamic(() => import('suneditor-react'), { ssr: false });
import SunEditorCore from "suneditor/src/lib/core";
import "suneditor/dist/css/suneditor.min.css";
import dynamic from "next/dynamic";

interface SunEditorOptions {
  buttonList?: string[][];
  defaultTag?: string;
  minHeight?: string;
  showPathLabel?: boolean;
  font?: string[];
  defaultStyle?: string;
}

interface SunEditorProps {
  width?: string | any;
  height?: string | any;
  placeholder?: string;
  autofocus?: boolean;
  setplugin?: boolean;
  setcontent?: string;
  appendcontent?: string;
  defaultstyle?: string;
  disable?: boolean;
  hide?: boolean;
  hidetoolbar?: boolean;
  disabletoolbar?: boolean;
  onLoad?: string;
  defaulContent?: string;
  onScroll?: (event: UIEvent) => void;
  onClick?: (event: MouseEvent) => void;
  onCopy?: (event: ClipboardEvent, clipboardData: DataTransfer | null) => boolean;
  onCut?: (event: ClipboardEvent, clipboardData: DataTransfer | null) => boolean;
  setoptions?: SunEditorOptions;
}


const SpkSunEditor: React.FC<SunEditorProps> = ({ width, height, placeholder, autofocus, setplugin, setcontent, appendcontent, defaultstyle, disable, hide, hidetoolbar, disabletoolbar, defaulContent, setoptions }) => {

  const editor = useRef<SunEditorCore | null>(null);

  const getSunEditorInstance = (sunEditor: SunEditorCore) => {
    editor.current = sunEditor;
  };

  const handleChange = (content: string) => {
  };

  const handleScroll = (event: UIEvent) => {
  };

  const handleClick = (event: MouseEvent) => {
  };

  const handleMouseDown = (event: MouseEvent) => {
  };

  const handleInput = (event: any) => {
  };

  const handleKeyUp = (event: KeyboardEvent) => {
  };

  const handleFocus = (event: FocusEvent) => {
  };

  const handleBlur = (event: FocusEvent, editorContents: string) => {
  };

  const handleKeyDown = (event: KeyboardEvent) => {
  };

  const handleDrop = (event: DragEvent) => {
  };

  const handleImageUploadBefore = (data: any) => {
    return true;
  };

  const handleImageUpload = (data: any) => {
  };

  const handleImageUploadError = (data: any) => {
  };

  const handleVideoUploadBefore = (data: any) => {
    return true;
  };

  const handleVideoUpload = (data: any) => {
  };

  const handleVideoUploadError = (data: any) => {
  };

  const handleAudioUploadBefore = (data: any) => {
    return true;
  };

  const handleAudioUpload = (data: any) => {
  };

  const handleAudioUploadError = (data: any) => {
  };

  const handleResizeEditor = (data: any) => {
  };

  const handleCopy = (event: ClipboardEvent, clipboardData: DataTransfer | null): boolean => {
    return true;
  };

  const handleCut = (event: ClipboardEvent, clipboardData: DataTransfer | null): boolean => {
    return true;
  };

  const handlePaste = (data: any) => {
  };

  const imageUploadHandler = (data: any) => {
  };

  const toggleCodeView = (data: any) => {
  };

  const toggleFullScreen = (data: any) => {
  };

  const showInline = (data: any) => {
  };

  const showController = (data: any) => {
  };

  const editorOptions: SunEditorOptions = {
    ...setoptions,
  };

  return (
    <Fragment>
      <SunEditor setOptions={editorOptions} getSunEditorInstance={getSunEditorInstance}
        width={width} height={height} placeholder={placeholder} autoFocus={autofocus}
        setAllPlugins={setplugin} setContents={setcontent} appendContents={appendcontent}
        setDefaultStyle={defaultstyle} disable={disable} hide={hide} hideToolbar={hidetoolbar}
        disableToolbar={disabletoolbar} defaultValue={defaulContent}
        onChange={handleChange}
        onScroll={handleScroll}
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        onInput={handleInput}
        onKeyUp={handleKeyUp}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        onDrop={handleDrop}
        onImageUploadBefore={handleImageUploadBefore}
        onImageUpload={handleImageUpload}
        onImageUploadError={handleImageUploadError}
        onVideoUploadBefore={handleVideoUploadBefore}
        onVideoUpload={handleVideoUpload}
        onVideoUploadError={handleVideoUploadError}
        onAudioUploadBefore={handleAudioUploadBefore}
        onAudioUpload={handleAudioUpload}
        onAudioUploadError={handleAudioUploadError}
        onResizeEditor={handleResizeEditor}
        onCopy={handleCopy}
        onCut={handleCut}
        onPaste={handlePaste}
        imageUploadHandler={imageUploadHandler}
        toggleCodeView={toggleCodeView}
        toggleFullScreen={toggleFullScreen}
        showInline={showInline}
        showController={showController}

      />
    </Fragment>
  );
};

export default SpkSunEditor;
