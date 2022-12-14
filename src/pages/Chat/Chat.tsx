import {
  AddressBook,
  Archive,
  CaretCircleDown,
  ClockCounterClockwise,
  NavigationArrow,
  Paperclip,
  PlusCircle,
  SignOut,
  Smiley,
  Users,
} from "phosphor-react";
import { v4 as uuidv4 } from "uuid";
import { useEffect, useState } from "react";
import { Input } from "../../components/Input/Input";
import { Line } from "../../components/Line/Line";
import { UserChat } from "../../components/UserChat/UserChat";
import { UserHeader } from "../../components/UserHeader/UserHeader";
import { UserMessage } from "../../components/UserMessage/UserMessage";
import { Welcome } from "../../components/Welcome/Welcome";
import { useAuth } from "../../context/AuthContext";
import { useChat } from "../../context/ChatContext";

import * as S from "./styles";

export const Chat = () => {
  const { signOutApp, user } = useAuth();
  const {
    readMessages,
    createChat,
    scrollToBottom,
    userFind,
    currentChat,
    chats,
    openChat,
    onChangeMessageInput,
    sendMessage,
    messagesEndRef,
    messageInput,
  } = useChat();
  const [scrollOnBottom, setScrollOnBottom] = useState(true);

  const chatId = document.getElementById("chat");

  const scrollCheck =
    (chatId?.scrollHeight && chatId?.scrollHeight > chatId?.clientHeight) ||
    false;

  useEffect(() => {
    scrollToBottom();
  }, []);

  useEffect(() => {
    if (!scrollCheck) {
      readMessages();
    }

    if (scrollOnBottom) {
      scrollToBottom();
    }
  }, [currentChat]);

  const handleScroll = async (event: React.UIEvent<HTMLDivElement>) => {
    const { scrollHeight, scrollTop, clientHeight } = event.currentTarget;
    const scrollPosition = scrollHeight - scrollTop - clientHeight;
    console.log(scrollPosition);
    if (scrollPosition <= 0) {
      setScrollOnBottom(true);

      if (currentChat && currentChat?.unreadMessage > 0) {
        readMessages();
      }
    } else {
      setScrollOnBottom(false);
    }
  };

  return (
    <S.Container>
      <S.Sidebar>
        <S.Margin>
          <S.HeaderSidebar>
            <span>React Chat</span>

            <div>
              <PlusCircle size={32} weight="fill" />
              <SignOut
                alt="logout"
                size={30}
                weight="fill"
                onClick={() => signOutApp()}
              />
            </div>
          </S.HeaderSidebar>

          <Input />

          <S.NavChat>
            <ClockCounterClockwise size={26} />
            <Users size={26} />
            <AddressBook size={26} />
            <Archive size={26} />
          </S.NavChat>

          {userFind ? (
            <>
              <UserChat
                onClick={() => createChat(userFind.uid)}
                image_url={userFind?.photoURL}
                lastMessage=" "
                name={userFind?.displayName}
                selected={false}
                unreadMessage={0}
              />
              <Line />
            </>
          ) : null}
        </S.Margin>

        {chats
          ? chats.map((chat) => {
              const lenght = chat.messages.length - 1;

              const uuid =
                chat.users.find((userid) => userid != user?.uid) ??
                "notFoundId";
              const uuidMessage =
                chat.messages[lenght]?.message.uuid || uuidv4();
              const lastMessage = chat.messages[lenght]?.message.msg || "";
              const unreadMessage = chat.messages.filter(
                (msg) =>
                  msg.message.read == false && msg.message.owner != user?.uid
              );
              const owner = chat.messages[lenght]?.message.owner == user?.uid;
              const date = chat.messages[lenght]?.message.data
                .toDate()
                .toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                });
              const read = chat.messages[lenght]?.message.read;
              return (
                <UserChat
                  key={uuidMessage}
                  onClick={() => {
                    openChat({
                      chatId: chat.id,
                      userName: chat.userInfos.displayName,
                      uuid,
                      messages: chat.messages,
                      photoUrl: chat.userInfos.photoURL,
                      unreadMessage: unreadMessage.length,
                    });
                    scrollToBottom();
                  }}
                  image_url={chat.userInfos.photoURL}
                  lastMessage={lastMessage}
                  name={chat.userInfos.displayName}
                  selected={chat.id == currentChat?.chatId}
                  unreadMessage={unreadMessage.length}
                  owner={owner}
                  date={date}
                  read={read}
                />
              );
            })
          : null}
      </S.Sidebar>

      <S.Chat>
        {scrollCheck && !scrollOnBottom && currentChat && (
          <CaretCircleDown
            size={32}
            className="arrowDown"
            weight="fill"
            onClick={() => scrollToBottom()}
          />
        )}
        {currentChat ? (
          <>
            <UserHeader userName={currentChat.userName} />
            <S.Content onScroll={handleScroll} id="chat">
              {currentChat.messages.map((message) => {
                const itsMe = message.message.owner.includes(user?.uid ?? "");
                const timeStamp = message.message.data
                  .toDate()
                  .toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                return (
                  <UserMessage
                    key={message.message.uuid}
                    date={timeStamp}
                    image_url={
                      itsMe && user?.photoURL
                        ? user?.photoURL
                        : currentChat.photoUrl
                    }
                    msg={message.message.msg}
                    read={message.message.read}
                    owner={itsMe}
                  />
                );
              })}

              <div ref={messagesEndRef} />
            </S.Content>

            <S.Footer>
              <form>
                <input
                  placeholder="Type a message..."
                  onChange={(e) => onChangeMessageInput(e.target.value)}
                  value={messageInput}
                />

                <S.ContainerButtons>
                  <Smiley size={25} />
                  <Paperclip size={25} className="paper-clip" />
                  <button onClick={(e) => sendMessage({ e })}>
                    {" "}
                    <NavigationArrow size={25} className="navigation-arrow" />
                  </button>
                </S.ContainerButtons>
              </form>
            </S.Footer>
          </>
        ) : (
          <Welcome />
        )}
      </S.Chat>
    </S.Container>
  );
};
