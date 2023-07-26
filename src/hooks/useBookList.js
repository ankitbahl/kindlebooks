import {useEffect, useState} from "react";
import axios from "axios";
import {getAuthCookie} from "../utils/cookieHelper.js";

export default function useBookList() {
  const [bookList, setBookList] = useState([]);
  const [selectedFileIndexes, setSelectedFileIndexes] = useState([]);
  const [downloadProgress, setDownloadProgress] = useState(-1);
  const [emailSentIndexes, setEmailSentIndexes] = useState([]);
  const [emailSendingIndexes, setEmailSendingIndexes] = useState([]);
  useEffect(() => {
    setSelectedFileIndexes(new Array(bookList.length).fill(0));
  }, [bookList]);
  const getBookList = (searchTerm, onResults) => {
    axios.get(`/book-list?searchTerm=${encodeURI(searchTerm)}`, {headers: {auth: getAuthCookie()}})
      .then(res => {
        if (res.data.data.length === 0) {
          alert('No results!');
        }
        setBookList(res.data.data);
        onResults();
      })
      .catch(e => {
        console.error(e);
        onResults();
      });
  }

  const downloadBook = (row) => {
    downloadAsync(row, '/download-book');
  }

  const downloadConvertBook = (row) => {
    downloadAsync(row, `/download-convert-book`);
  }

  const downloadAsync = (row, serverPath) => {
    const url = bookList[row].files[selectedFileIndexes[row]].links[0];
    const filename = bookList[row].title;
    const extension = bookList[row].files[selectedFileIndexes[row]].type.toLowerCase();
    const file = `${filename}.${extension}`;
    axios.get(`${serverPath}?bookUrl=${encodeURI(url)}`,
      {
        responseType: 'blob',
        headers: {auth: getAuthCookie()},
        onDownloadProgress: progressEvent => {
          console.log(progressEvent);
          const downloadPercent = Math.round(100 * progressEvent.loaded / progressEvent.total);
          console.log(downloadPercent)
          setDownloadProgress(downloadPercent);
          if (downloadPercent >= 100) {
            setDownloadProgress(-1);
          }
        }
      })
      .then(res => {
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${file}`);
        document.body.appendChild(link);
        link.click();
      })
      .catch(e => {
        console.error(e);
        setDownloadProgress(-1);
      });
  }

  const addSentEmailIndex = (index) => {
    const oldEmailSentIndexes = [...emailSentIndexes];
    oldEmailSentIndexes.push(index);
    setEmailSentIndexes(oldEmailSentIndexes);
  }

  const addSendingEmailIndex = (index) => {
    const oldEmailSendingIndexes = [...emailSendingIndexes];
    oldEmailSendingIndexes.push(index);
    setEmailSendingIndexes(oldEmailSendingIndexes);
  }

  const removeSendingEmailIndex = (index) => {
    const oldEmailSendingIndexes = [...emailSendingIndexes];
    delete oldEmailSendingIndexes[oldEmailSendingIndexes.indexOf(index)];
    setEmailSendingIndexes(oldEmailSendingIndexes);
  }

  const emailBook = (row, selectedKindle) => {
    const url = bookList[row].files[selectedFileIndexes[row]].links[0];
    addSendingEmailIndex(row);

    axios.get(`/send-to-kindle?bookUrl=${encodeURI(url)}&selectedKindle=${selectedKindle}`, {responseType: 'blob', headers: {auth: getAuthCookie()}})
      .then(res => {
        addSentEmailIndex(row);
        removeSendingEmailIndex(row);
      })
      .catch(e => {
        alert('Error, check console for more info')
        removeSendingEmailIndex(row);
        console.error(e)
      });
  }

  const setSelectedFile = (rowIndex, fileIndex) => {
    const indexes = [...selectedFileIndexes];
    indexes[rowIndex] = fileIndex;
    setSelectedFileIndexes(indexes);
  }

  return [{ bookList, getBookList },
          { selectedFileIndexes, setSelectedFile },
          { downloadBook, emailBook, emailSentIndexes, emailSendingIndexes },
          { downloadProgress }];
}
