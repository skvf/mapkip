import CodeMirror from '@uiw/react-codemirror'

function CodeEditor({ value, onChangeValue }) {
  return <CodeMirror value={value} extensions={[]} onChange={onChangeValue} />
}

export default CodeEditor
