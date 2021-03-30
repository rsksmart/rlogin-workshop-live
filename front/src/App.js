import { useState } from 'react'
import RLogin, { RLoginButton } from '@rsksmart/rlogin'
import WalletConnectProvider from '@walletconnect/web3-provider'
import axios from 'axios'
import './App.css';

const rLogin = new RLogin({
  cachedProvider: false,
  providerOptions: { // read more about providers setup in https://github.com/web3Modal/web3modal/
    walletconnect: {
      package: WalletConnectProvider, // setup wallet connect for mobile wallet support
      options: {
        rpc: {
          31: 'https://public-node.testnet.rsk.co' // use RSK public nodes to connect to the testnet
        }
      }
    }
  },
  backendUrl: 'http://localhost:3011',
  supportedChains: [31] // enable rsk testnet network
})

function App() {
  const [provider, setProvider] = useState(null)
  const [dataVault, setDataVault] = useState(null)
  const [account, setAccount] = useState('')

  const [to, setTo] = useState('')
  const [value, setValue] = useState('')
  const [txHash, setTxHash] = useState('')

  const [notProtectedResponse, setNotProtectedResponse] = useState('')
  const [protectedResponse, setProtectedResponse] = useState('')

  const [content, setContent] = useState(null)
  const [newContent, setNewContent] = useState('')

  const connect = () => rLogin.connect()
    .then(({ provider, dataVault }) => { // the provider is used to operate with user's wallet
      setProvider(provider)
      setDataVault(dataVault)

      // request user's account
      provider.request({ method: 'eth_accounts' }).then(([account]) => setAccount(account.toLowerCase()))
    })

  const send = () => provider.request({ method: 'eth_sendTransaction', params: [
    { from: account, to, value }
  ]}).then(setTxHash)

  const notProtected = () => axios.get('http://localhost:3011/not-protected').then(r => setNotProtectedResponse(r.data))
  const protecteddd = () => axios.get('http://localhost:3011/protected', {
    headers: {
      'Authorization': `DIDAuth ${localStorage.getItem('RLOGIN_ACCESS_TOKEN')}`
    }
  })
    .then(r => setProtectedResponse(r.data))
    .catch(e => setProtectedResponse(e.message))

  const getSomeInfo = () => dataVault.get({ did: `did:ethr:rsk:testnet:${account}`, key: 'Workshop_sample' }).then(setContent)
  const addContent = () => dataVault.create({ key: 'Workshop_sample', content: newContent })

  return (
    <div className="App">
      <RLoginButton onClick={connect}>connect wallet</RLoginButton>
      <p>account: {account}</p>
      <hr />
      <div>
        <input type="text" value={to} onChange={e => setTo(e.target.value)} placeholder="to" />
        <input type="number" value={value} onChange={e => setValue(e.target.value)} placeholder="value" />
        <button onClick={send}>Send</button>
        <p>tx: {txHash}</p>
      </div>
      <hr />
      <div>
        <button onClick={notProtected}>not protected</button>
        <p>response: {notProtectedResponse}</p>
      </div>
      <div>
        <button onClick={protecteddd}>protected</button>
        <p>response: {protectedResponse}</p>
      </div>
      <hr />
      <div>
        <button onClick={getSomeInfo}>get some info</button>
        {content && content.map(c => <p key={c.id}>{c.content} ({c.id})</p>)}
      </div>
      <div>
        <input type="text" value={newContent} onChange={e => setNewContent(e.target.value)} />
        <button onClick={addContent}>add content</button>
      </div>
    </div>
  );
}

export default App;
