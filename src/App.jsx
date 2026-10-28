import { useEffect, useState } from 'react'
import { supabase } from './lib/supabaseClient'
import { useUser } from './context/UserContext'
import { useNav } from './hooks/useNav'

import Login from './pages/Login'
import styles from "./etc/styles";

import Welcome from './pages/Welcome'

import CardList from './pages/todo/CardList'
import CardDetail from './pages/todo/CardDetail'
import ToDoList from './pages/todo/ToDoList'
import OverdueList from './pages/todo/OverdueList'

import AccountBook from './pages/acct/AccountBook'
import AccountBookDetail from './pages/acct/AccountBookDetail'
import AcctSettings from './pages/acct/AcctSettings'
import AcctBookSettings from './pages/acct/AcctBookSettings'
import AcctPhraseSettings from './pages/acct/AcctPhraseSettings'


import { CapacitorShareTarget } from '@capgo/capacitor-share-target'
import { App as CapApp } from '@capacitor/app'
import { refreshNotifications } from './utils/notify'

function App() {

  // 로그인 상태 (undefined = 확인 중, null = 로그아웃, 객체 = 로그인됨)
  const [session, setSession] = useState(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  const { user } = useUser();
  const { screen, push, replace, back, guardRef } = useNav({ name: 'welcome' });

  // 사진 공유 받기
  useEffect(() => {
    let handle;
    CapacitorShareTarget.addListener('shareReceived', (event) => {
      const images = (event.files || []).filter((f) => f.mimeType?.startsWith('image/'));
      if (images.length) push({ name: 'carddetail', todoUuid: null, sharedFiles: images });
    }).then((h) => { handle = h; });
    return () => { handle?.remove(); };
  }, [push]);

  // 화면을 옮길 때마다 알림 다시 예약 (카드 저장 후 돌아올 때도 여기서 처리됨)
  useEffect(() => { if (session) refreshNotifications(); }, [screen.name, session]);

  // 앱을 다시 열었을 때도 알림 다시 예약
  useEffect(() => {
    let handle;
    CapApp.addListener('appStateChange', ({ isActive }) => {
      if (isActive && session) refreshNotifications();
    }).then((h) => { handle = h; });
    return () => { handle?.remove(); };
    }, [session]);

  const openCardDetail = (todoUuid = null) =>
    push({ name: 'carddetail', todoUuid });

  if (session === undefined) {
    return <div style={{ minHeight: "100vh", background: "#f0f2f7" }} />;
  }
  if (!session) {
    return (
      <>
        <style>{styles}</style>
        <Login />
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>

      {screen.name === 'welcome' && (
        <Welcome onNavigate={(name) => push({ name })} onUser={user} />
      )}

      {screen.name === 'cardlist' && (
        <CardList onBack={back} onUser={user} onOpenCard={openCardDetail} onQuickNav={(name) => replace({ name })} />
      )}

      {screen.name === 'todolist' && (
        <ToDoList
        onBack={back}
        onUser={user}
        onOpenCard={openCardDetail}
        onNavigateOverdue={() => push({ name: 'overdue' })}
        onQuickNav={(name) => replace({ name })}
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
          onQuickNav={(name) => replace({ name })}
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