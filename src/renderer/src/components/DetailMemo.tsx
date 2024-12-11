import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import {
  $getSelection,
  $isRangeSelection,
  EditorState,
  Klass,
  LexicalEditor,
  LexicalNode
} from 'lexical'
import { $getNearestNodeOfType } from '@lexical/utils'
import {
  ListNode,
  ListItemNode,
  INSERT_UNORDERED_LIST_COMMAND,
  $isListNode,
  INSERT_ORDERED_LIST_COMMAND
} from '@lexical/list'
import { ListPlugin } from '@lexical/react/LexicalListPlugin'
import { TabIndentationPlugin } from '@lexical/react/LexicalTabIndentationPlugin'
import { LinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link'
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin'
import { ClickableLinkPlugin } from '@lexical/react/LexicalClickableLinkPlugin'
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $canShowPlaceholder } from '@lexical/text'
import { useCallback, useEffect, useRef, useState } from 'react'
import { VscLink, VscListOrdered, VscListUnordered } from 'react-icons/vsc'

const nodes: Klass<LexicalNode>[] = [ListNode, ListItemNode, LinkNode]
const theme = {
  list: {
    ul: 'list-disc pl-4',
    ol: 'list-decimal pl-4',
    nested: {
      listitem: 'list-none'
    }
  },
  link: 'text-blue-500 underline cursor-pointer'
}

type Props = {
  memo: string | null | undefined
  onChange: (memo: string | null) => void
  debounceMillis?: number
}

function DetailMemo({ memo, onChange, debounceMillis = 500 }: Props) {
  const initialConfig = {
    namespace: 'detailMemo',
    nodes: nodes,
    theme: theme,
    editorState: memo,
    onError: (error) => console.log(error)
  }

  const [memoDebounceTimer, setMemoDebounceTimer] = useState<NodeJS.Timeout | null>(null)
  const startDebounceMemoUpdate = (editor, value: string) => {
    if (memoDebounceTimer) {
      clearTimeout(memoDebounceTimer)
    }
    setMemoDebounceTimer(
      setTimeout(() => {
        editor.read(() => {
          const isEmpty = $canShowPlaceholder(false)
          onChange(isEmpty ? null : value)
        })
      }, debounceMillis)
    )
  }

  return (
    <div className="m-1">
      <LexicalComposer initialConfig={initialConfig}>
        <AutoFocusPlugin />
        <HistoryPlugin />
        <ListPlugin />
        <TabIndentationPlugin />
        <LinkPlugin validateUrl={validateUrl} />
        <ClickableLinkPlugin />
        <OnChangePlugin
          onChange={(editorState: EditorState, editor: LexicalEditor) => {
            startDebounceMemoUpdate(editor, JSON.stringify(editorState))
          }}
        />
        <Toolbar />
        <RichTextPlugin
          contentEditable={
            <ContentEditable
              className=" min-h-56 p-2 rounded-b-lg border-l border-b border-r border-gray-300 outline-none focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              placeholder={
                <span className="relative left-2 bottom-[13.5rem] text-gray-500 pointer-events-none select-none">
                  メモを追加
                </span>
              }
              aria-placeholder="メモを追加"
            />
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
      </LexicalComposer>
    </div>
  )
}

const SupportedBlockType = {
  paragraph: 'Paragraph',
  number: 'Numbered List',
  bullet: 'Bulleted List'
} as const
type BlockType = keyof typeof SupportedBlockType

function Toolbar() {
  const [blockType, setBlockType] = useState<BlockType>('paragraph')
  const [editor] = useLexicalComposerContext()

  const formatBulletList = useCallback(() => {
    if (blockType !== 'bullet') {
      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)
    }
  }, [editor, blockType])
  const formatNumberList = useCallback(() => {
    if (blockType !== 'number') {
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)
    }
  }, [editor, blockType])
  const formatLink = useCallback(
    (url: string) => {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, url)
    },
    [editor]
  )

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection()
        if (!$isRangeSelection(selection)) {
          return
        }
        const anchorNode = selection.anchor.getNode()
        const targetNode =
          anchorNode.getKey() === 'root' ? anchorNode : anchorNode.getTopLevelElementOrThrow()

        if ($isListNode(targetNode)) {
          const parentList = $getNearestNodeOfType(anchorNode, ListNode)
          const listType = parentList ? parentList.getListType() : targetNode.getListType()
          setBlockType(listType === 'bullet' || listType === 'number' ? listType : 'bullet')
        } else {
          const nodeType = targetNode.getType()
          if (nodeType in SupportedBlockType) {
            setBlockType(nodeType as BlockType)
          } else {
            setBlockType('paragraph')
          }
        }
      })
    })
  }, [editor])

  const dialogRef = useRef<HTMLDialogElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  return (
    <div className="rounded-t-lg border border-gray-300 ">
      <button
        title="順序なしリスト"
        className="p-1 hover:bg-gray-100 overflow-hidden"
        onClick={formatBulletList}
      >
        <VscListUnordered className="w-6 h-6" />
      </button>
      <button
        title="順序付きリスト"
        className="p-1 hover:bg-gray-100 overflow-hidden"
        onClick={formatNumberList}
      >
        <VscListOrdered className="w-6 h-6" />
      </button>
      <button
        title="リンク"
        className="p-1 hover:bg-gray-100 overflow-hidden"
        onClick={() => dialogRef.current?.showModal()}
      >
        <VscLink className="w-6 h-6" />
      </button>
      <dialog
        ref={dialogRef}
        className="rounded-lg p-3"
        onClick={(e) => {
          if (e.target === dialogRef.current) {
            dialogRef.current?.close()
          }
        }}
      >
        <div className="text-gray-700 text-sm flex flex-col h-[30dvh] w-[50dvw]">
          <h3 className="p-2 text-xl">🔗 リンクを設定</h3>
          <form
            ref={formRef}
            onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.target as HTMLFormElement)
              const url = (formData.get('url') as string).trim()
              if (validateUrl(url)) {
                formatLink(url)
              }
              dialogRef.current?.close()
              formRef.current?.reset()
            }}
          >
            <div className="p-1 flex-1 overflow-scroll flex flex-col">
              <input
                name="url"
                type="text"
                className="block w-full text-sm rounded-lg border border-gray-200 ring-inset ring-gray-200 placeholder:text-gray-400 focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                placeholder="https://www.example.com"
              />
            </div>
            <div className="flex space-x-5 justify-center">
              <button
                type="submit"
                className="w-20 border border-blue-500 bg-blue-500 text-white px-3 py-1.5 rounded-lg"
              >
                設定
              </button>
              <button
                className="w-20 border border-gray-200 bg-white text-gray-700 px-3 py-1.5 rounded-lg"
                onClick={(e) => {
                  e.preventDefault()
                  dialogRef.current?.close()
                  formRef.current?.reset()
                }}
              >
                閉じる
              </button>
            </div>
          </form>
        </div>
      </dialog>
    </div>
  )
}

export default DetailMemo

function validateUrl(url: string) {
  if (url.match(/^\s*$/)) {
    return false
  }
  return true
}
