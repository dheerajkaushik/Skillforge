import Editor from "@monaco-editor/react";


export default function CodeEditor({ code, setCode }) {
return (
<Editor
height="400px"
language="java"
theme="vs-dark"
value={code}
onChange={(value) => setCode(value)}
options={{
fontSize: 14,
minimap: { enabled: false },
automaticLayout: true,
}}
/>
);
}