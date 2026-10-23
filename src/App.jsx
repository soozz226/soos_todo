import { useEffect } from 'react'
import styles from "./etc/styles";
import Welcome from './pages/Welcome'
import CardList from './pages/CardList'
import CardDetail from './pages/CardDetail'
import ToDoList from './pages/ToDoList'
import AccountBook from './pages/AccountBook'
import OverdueList from './pages/OverdueList'
import { useUser } from './context/UserContext'
import { useNav } from './hooks/useNav'
import AccountBookDetail from './pages/AccountBookDetail'
import AcctSettings from './pages/AcctSettings'
import AcctBookSettings from './pages/AcctBookSettings'
import AcctPhraseSettings from './pages/AcctPhraseSettings'
import { CapacitorShareTarget } from '@capgo/capacitor-share-target'

function App() {
  const { user } = useUser();
  const { screen, push, back, guardRef } = useNav({ name: 'welcome' });

  // 사진 공유 받기
  useEffect(() => {
    let handle;
    CapacitorShareTarget.addListener('shareReceived', (event) => {
      const images = (event.files || []).filter((f) => f.mimeType?.startsWith('image/'));
      if (images.length) push({ name: 'carddetail', todoUuid: null, sharedFiles: images });
    }).then((h) => { handle = h; });
    return () => { handle?.remove(); };
  }, [push]);

  const openCardDetail = (todoUuid = null) =>
    push({ name: 'carddetail', todoUuid });

  return (
    <>
      <style>{styles}</style>

      {screen.name === 'welcome' && (
        <Welcome onNavigate={(name) => push({ name })} onUser={user} />
      )}

      {screen.name === 'cardlist' && (
        <CardList onBack={back} onUser={user} onOpenCard={openCardDetail} />
      )}

      {screen.name === 'todolist' && (
        <ToDoList
          onBack={back}
          onUser={user}
          onOpenCard={openCardDetail}
          onNavigateOverdue={() => push({ name: 'overdue' })}
        />
      )}

      {screen.name === 'carddetail' && (
        <CardDetail
          key={screen.sharedFiles?.[0]?.uri || screen.todoUuid || 'new'}
          todoUuid={screen.todoUuid}
          sharedFiles={screen.sharedFiles}
          onBack={back}
          guardRef={guardRef}
          onOpenAcct={({ book, memo, todoUuid, date }) =>
            push({ name: 'acctbookdetail', date: date || null, entry: null, book, typeCodes: [], zero: false, initialMemo: memo, linkTodo: todoUuid })}
        />
      )}

      {screen.name === 'overdue' && (
        <OverdueList onBack={back} onUser={user} onOpenCard={openCardDetail} />
      )}

      {screen.name === 'acctbook' && (
        <AccountBook
          onBack={back}
          onOpenEntry={(date = null, entry = null, book = null, typeCodes = [], zero = false) =>
            push({ name: 'acctbookdetail', date, entry, book, typeCodes, zero })}
          onOpenSettings={(book = null) => push({ name: 'acctsettings', book })}
        />
      )}

      {screen.name === 'acctbookdetail' && (
        <AccountBookDetail
          key={screen.entry?.acct_uuid || 'new'}
          book={screen.book}
          typeCodes={screen.typeCodes}
          zero={screen.zero}
          date={screen.date}
          entry={screen.entry}
          initialMemo={screen.initialMemo}
          linkTodo={screen.linkTodo}
          onBack={back}
        />
      )}
      {screen.name === 'acctsettings' && (
        <AcctSettings
          onBack={back}
          onNavigate={(name) => push({ name, book: screen.book })}
        />
      )}
      
      {screen.name === 'acctsettingbooks' && <AcctBookSettings onBack={back} />}
      
      {screen.name === 'acctsettingphrases' && (
        <AcctPhraseSettings book={screen.book} onBack={back} />
      )}
    </>
  )
}

export default App